/**
 * -----------------------------------------------------------------------------
 * Custom Voice Creation Endpoint
 * -----------------------------------------------------------------------------
 * Handles voice cloning uploads at `POST /api/voices/create`. It exists as the
 * ingestion pipeline for custom voices: it validates metadata, checks the
 * organization's Polar subscription, validates the uploaded audio (size,
 * format, duration), persists a Voice record, and stores the sample in
 * Cloudflare R2. Kept as a raw Route Handler (rather than tRPC) because the
 * request body is a binary audio file, not JSON.
 *
 * HTTP method: POST
 * Input: binary audio file as the request body; metadata passed as query
 *   params — `name` (required), `category` (must be a valid VoiceCategory),
 *   `language` (required), `description` (optional). Content-Type header
 *   required.
 * Auth: authenticated Clerk user with an active organization AND an active
 *   Polar subscription (voice creation is a paid feature).
 * Side effects: creates a Voice row in Prisma, uploads the audio to R2 at
 *   `voices/orgs/<orgId>/<voiceId>`, updates the row with the R2 key, and
 *   ingests a usage event into Polar for metered billing. On failure after
 *   the DB write, the created Voice row is rolled back (deleted).
 * Responses: 201 { name, message } | 400 invalid input/missing file |
 *   401 unauthorized | 403 no active subscription | 413 file too large |
 *   422 invalid/too-short audio | 500 creation failed.
 */
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { parseBuffer } from "music-metadata";
import { z } from "zod";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/r2";
import { VOICE_CATEGORIES } from "@/features/voices/data/voice-categories";
import type { VoiceCategory } from "@/generated/prisma/client";

// Metadata is validated against the same category list used across the app,
// cast to a tuple so zod generates a proper enum schema.
const createVoiceSchema = z.object({
    name: z.string().min(1, "Voice name is required"),
    category: z.enum(VOICE_CATEGORIES as [VoiceCategory, ...VoiceCategory[]]),
    language: z.string().min(1, "Language is required"),
    description: z.string().nullish(),
});

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const MIN_AUDIO_DURATION_SECONDS = 10;

/**
 * Creates a custom voice from an uploaded audio sample.
 *
 * @param request - POST request whose body is the raw audio file and whose
 *   query params carry the voice metadata.
 * @returns A JSON response with the created voice's name on success, or an
 *   `{ error }` (and optionally `{ issues }`) payload on failure.
 */
export async function POST(request: Request) {
    // Auth guard: voice creation requires both a user session and an active
    // organization, since voices are owned by organizations.
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for active subscription before voice creation
    try {
        const customerState = await polar.customers.getStateExternal({
            externalId: orgId,
        });
        const hasActiveSubscription =
            (customerState.activeSubscriptions ?? []).length > 0;
        if (!hasActiveSubscription) {
            return Response.json({ error: "SUBSCRIPTION REQUIRED" }, { status: 403 });
        }
    } catch {
        // Customer doesn't exist in Polar yet -> no subscription
        return Response.json({ error: "SUBSCRIPTION REQUIRED" }, { status: 403 });
    }

    // Metadata arrives via query params (not the body) so the body can stay a
    // pure binary stream for the audio file itself.
    const url = new URL(request.url);

    const validation = createVoiceSchema.safeParse({
        name: url.searchParams.get("name"),
        category: url.searchParams.get("category"),
        language: url.searchParams.get("language"),
        description: url.searchParams.get("description"),
    });

    if (!validation.success) {
        return Response.json(
            {
                error: "Invalid input",
                issues: validation.error.issues,
            },
            { status: 400 },
        );
    }

    const { name, category, language, description } = validation.data;

    // Buffer the entire upload in memory — acceptable because of the 20 MB cap
    // enforced below, and necessary for both size checks and metadata parsing.
    const fileBuffer = await request.arrayBuffer();

    if (!fileBuffer.byteLength) {
        return Response.json(
            { error: "Please upload an audio file" },
            { status: 400 },
        );
    }

    if (fileBuffer.byteLength > MAX_UPLOAD_SIZE_BYTES) {
        return Response.json(
            { error: "Audio file exceeds the 20 MB size limit" },
            { status: 413 },
        );
    }

    const contentType = request.headers.get("content-type");

    if (!contentType) {
        return Response.json(
            { error: "Missing Content-Type header" },
            { status: 400 },
        );
    }

    // Strip parameters (e.g. "; charset=binary") so music-metadata receives a
    // bare MIME type, defaulting to WAV if parsing yields nothing.
    const normalizedContentType =
        contentType.split(";")[0]?.trim() || "audio/wav";

    // Validate audio format and duration
    // Parse the buffer's real audio metadata: rejects non-audio payloads the
    // Content-Type header may have claimed, and enforces a minimum sample
    // length so cloned voices have enough material to train on.
    let duration: number;
    try {
        const metadata = await parseBuffer(
            new Uint8Array(fileBuffer),
            { mimeType: normalizedContentType },
            { duration: true },
        );
        duration = metadata.format.duration ?? 0;
    } catch {
        return Response.json(
            { error: "File is not a valid audio file" },
            { status: 422 },
        );
    }

    if (duration < MIN_AUDIO_DURATION_SECONDS) {
        return Response.json(
            {
                error: `Audio too short (${duration.toFixed(1)}s). Minimum duration is ${MIN_AUDIO_DURATION_SECONDS} seconds.`,
            },
            { status: 422 },
        );
    }

    // Create-then-upload: the Voice row is created first so its ID can form
    // the R2 object key. If the upload or key update fails, the row is deleted
    // to avoid leaving a voice record pointing at missing audio.
    let createdVoiceId: string | null = null;

    try {
        const voice = await prisma.voice.create({
            data: {
                name,
                variant: "CUSTOM",
                orgId,
                description,
                category,
                language,
            },
            select: {
                id: true,
            },
        });

        createdVoiceId = voice.id;
        // Object key is org-scoped so R2 layout mirrors tenant ownership.
        const r2ObjectKey = `voices/orgs/${orgId}/${voice.id}`;

        await uploadAudio({
            buffer: Buffer.from(fileBuffer),
            key: r2ObjectKey,
            contentType: normalizedContentType,
        });

        await prisma.voice.update({
            where: {
                id: voice.id,
            },
            data: {
                r2ObjectKey,
            },
        });
    } catch {
        // Compensating rollback: remove the orphaned DB row if the R2 upload
        // or the r2ObjectKey update failed. Deletion errors are swallowed so
        // the client still gets the 500 rather than a secondary failure.
        if (createdVoiceId) {
            await prisma.voice
                .delete({
                    where: {
                        id: createdVoiceId,
                    },
                })
                .catch(() => { });
        }

        return Response.json(
            { error: "Failed to create voice. Please retry." },
            { status: 500 },
        );
    }

    // Ingest usage event to Polar
    // Meter the creation for usage-based billing. Metering failures are logged
    // but intentionally non-fatal: the voice already exists, so failing the
    // request would only confuse the user over a billing-side hiccup.
    try {
        await polar.events.ingest({
            events: [
                {
                    name: env.POLAR_METER_VOICE_CREATION,
                    externalCustomerId: orgId,
                    metadata: {},
                    timestamp: new Date(),
                },
            ],
        });
    } catch (err) {
        console.error("Failed to ingest usage event:", err);
        // Silently fail - don't break the user experience for metering errors
    }

    return Response.json(
        { name, message: "Voice created successfully" },
        { status: 201 },
    );
};