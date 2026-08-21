/**
 * -----------------------------------------------------------------------------
 * Object storage client (S3-compatible API)
 * -----------------------------------------------------------------------------
 * Thin wrapper around an S3-compatible object store used for all audio blobs
 * in the app: custom voice samples and generated TTS audio. Consumers are the
 * tRPC routers (`generations.ts` uploads, `voices.ts` deletes), the voice
 * creation route (`/api/voices/create`), and the streaming routes
 * (`/api/audio/[generationId]`, `/api/voices/[voiceId]`) which fetch
 * short-lived signed URLs instead of exposing objects publicly.
 *
 * Note: despite the R2_* env var names, the endpoint currently points at
 * Google Cloud Storage's S3-compatible API, so any S3-compatible provider
 * can be swapped in via env config alone.
 */
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

// Single shared S3 client; bucket/credentials come from validated env vars.
const r2 = new S3Client({
    region: env.AWS_REGION,
    endpoint: "https://storage.googleapis.com",
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
});

type UploadAudioOptions = {
    buffer: Buffer;
    key: string;
    contentType?: string;
};

/**
 * Uploads an audio buffer to the configured bucket.
 *
 * @param options.buffer - Raw audio bytes to store.
 * @param options.key - Object key/path inside the bucket (e.g. `generations/orgs/<orgId>/<id>`).
 * @param options.contentType - MIME type; defaults to WAV since chatterbox returns WAV.
 * @returns Resolves when the object is persisted.
 */
export async function uploadAudio({
    buffer,
    key,
    contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
    await r2.send(
        new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }),
    );
};

/**
 * Deletes an audio object from the configured bucket.
 *
 * @param key - Object key previously returned by an upload.
 * @returns Resolves when the delete command completes (idempotent for missing keys).
 */
export async function deleteAudio(key: string): Promise<void> {
    await r2.send(
        new DeleteObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
        }),
    );
};

/**
 * Generates a short-lived pre-signed GET URL for private playback.
 *
 * Objects are not public, so clients stream audio through a signed URL that
 * expires rather than through the app server.
 *
 * @param key - Object key to sign.
 * @returns A URL valid for 1 hour (3600 seconds).
 */
export async function getSignedAudioUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
    });
    return getSignedUrl(r2, command, { expiresIn: 3600 }); // 1 hour
};