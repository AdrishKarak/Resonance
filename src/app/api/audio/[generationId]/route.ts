/**
 * -----------------------------------------------------------------------------
 * Generation Audio Stream Endpoint
 * -----------------------------------------------------------------------------
 * Serves the generated WAV audio for a speech generation at
 * `GET /api/audio/[generationId]`. It exists because generated audio lives in
 * a private Cloudflare R2 bucket: instead of exposing signed R2 URLs to the
 * client, this route authenticates the caller, verifies org ownership of the
 * generation, then proxies the R2 object through the server, streaming its
 * body straight to the browser. The TTS studio's `<audio>` elements and
 * preview players point at this endpoint.
 *
 * HTTP method: GET
 * Input: `generationId` path segment.
 * Auth: requires an authenticated Clerk user with an active organization.
 * Side effects: none (read-only; fetches from R2 via a short-lived signed URL).
 * Responses: 200 audio/wav stream | 401 unauthorized | 404 generation not
 *   found in this org | 409 audio not yet uploaded | 502 R2 fetch failed.
 */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getSignedAudioUrl } from "@/lib/r2";

/**
 * Streams a generation's audio from R2 after verifying ownership.
 *
 * @param _request - Unused request object (no query params or body needed).
 * @param params - Route params containing the `generationId` path segment.
 * @returns A streamed audio/wav response, or an error status as described in
 *   the file header.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ generationId: string }> },
) {
    // Auth guard: both a user session and an active organization are required,
    // since generations are scoped per organization.
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { generationId } = await params;

    // Ownership check: filtering by orgId in the where clause guarantees a
    // generation belonging to another org is indistinguishable from missing.
    const generation = await prisma.generation.findUnique({
        where: { id: generationId, orgId },
    });

    if (!generation) {
        return new Response("Not found", { status: 404 });
    }

    // 409 signals "still processing" — the generation row exists but the TTS
    // job hasn't finished uploading the audio to R2 yet.
    if (!generation.r2ObjectKey) {
        return new Response("Audio is not available yet", { status: 409 });
    }

    const signedUrl = await getSignedAudioUrl(generation.r2ObjectKey);
    const audioResponse = await fetch(signedUrl);

    if (!audioResponse.ok) {
        return new Response("Failed to fetch audio", { status: 502 });
    }

    // Stream the R2 response body through without buffering it in memory.
    // Cache-Control is private so intermediaries don't cache org-scoped audio;
    // one hour of browser caching avoids re-proxying repeated plays.
    return new Response(audioResponse.body, {
        headers: {
            "Content-Type": "audio/wav",
            "Cache-Control": "private, max-age=3600",
        },
    });
};