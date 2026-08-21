/**
 * -----------------------------------------------------------------------------
 * Voice Preview Audio Endpoint
 * -----------------------------------------------------------------------------
 * Serves a voice's sample audio at `GET /api/voices/[voiceId]`. It exists so
 * the voices library and TTS studio can play previews without exposing
 * private R2 URLs: the route authenticates the caller, applies access rules
 * (system voices are shared; custom voices are org-private), then proxies the
 * R2 object's body through to the client. `<audio>` elements across the app
 * point at this endpoint.
 *
 * HTTP method: GET
 * Input: `voiceId` path segment.
 * Auth: authenticated Clerk user with an active organization. CUSTOM voices
 *   are only served to their owning org; SYSTEM voices are served to all.
 * Side effects: none (read-only).
 * Responses: 200 audio stream | 401 unauthorized | 404 not found or not
 *   owned | 409 sample audio not yet uploaded | 502 R2 fetch failed.
 */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getSignedAudioUrl } from "@/lib/r2";

/**
 * Streams a voice's sample audio from R2 after applying access rules.
 *
 * @param _request - Unused request object (no query params or body needed).
 * @param params - Route params containing the `voiceId` path segment.
 * @returns A streamed audio response with cache headers tuned per voice type,
 *   or an error status as described in the file header.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ voiceId: string }> },
) {
    // Auth guard: both a user session and an active organization are required;
    // org context drives the custom-voice ownership check below.
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { voiceId } = await params;

    const voice = await prisma.voice.findUnique({
        where: { id: voiceId },
        select: {
            variant: true,
            orgId: true,
            r2ObjectKey: true,
        },
    });

    if (!voice) {
        return new Response("Not found", { status: 404 });
    }

    // Access rule: CUSTOM voices belong to a single org and return 404 (not
    // 403) to other orgs so their existence isn't leaked. SYSTEM voices are
    // shared across every organization.
    if (voice.variant === "CUSTOM" && voice.orgId !== orgId) {
        return new Response("Not found", { status: 404 });
    }

    // 409 signals "still processing" — the voice row exists but its sample
    // hasn't been uploaded to R2 yet.
    if (!voice.r2ObjectKey) {
        return new Response("Voice audio is not available yet", { status: 409 });
    }

    const signedUrl = await getSignedAudioUrl(voice.r2ObjectKey);
    const audioResponse = await fetch(signedUrl);

    if (!audioResponse.ok) {
        return new Response("Failed to fetch voice audio", { status: 502 });
    }

    // Trust R2's content type when present, falling back to WAV. System voice
    // samples never change, so they're cached publicly for a day; custom
    // samples stay private with a shorter one-hour browser cache.
    const contentType =
        audioResponse.headers.get("content-type") || "audio/wav";

    return new Response(audioResponse.body, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control":
                voice.variant === "SYSTEM"
                    ? "public, max-age=86400"
                    : "private, max-age=3600",
        },
    });
};