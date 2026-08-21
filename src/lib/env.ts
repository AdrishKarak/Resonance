/**
 * -----------------------------------------------------------------------------
 * Typed environment variables
 * -----------------------------------------------------------------------------
 * Centralizes all server-side environment configuration behind a Zod-validated
 * schema using t3-oss/env-nextjs. This guarantees the app fails fast at startup
 * if any required secret (Polar billing, database, R2 storage, or the
 * chatterbox TTS API) is missing or malformed, instead of surfacing as a
 * cryptic runtime error deep in a request handler.
 *
 * Every server module that talks to an external service imports `env` from
 * here: `db.ts` (DATABASE_URL), `polar.ts` (POLAR_ vars), `r2.ts`
 * (R2/AWS vars), and `chatterbox-client.ts` (CHATTERBOX_ vars).
 */
import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
    server: {
        // Polar billing: access token, target server (sandbox vs production),
        // the single product all orgs subscribe to, and the meter identifiers
        // used for usage-based billing events.
        POLAR_ACCESS_TOKEN: z.string().min(1),
        POLAR_SERVER: z.enum(["sandbox", "production"]).default("sandbox"),
        POLAR_PRODUCT_ID: z.string().min(1),
        POLAR_METER_VOICE_CREATION: z.string().min(1),
        POLAR_METER_TTS_GENERATION: z.string().min(1),
        POLAR_METER_TTS_PROPERTY: z.string().min(1),

        // PostgreSQL connection string (normalized in database-url.ts before use).
        DATABASE_URL: z.string().min(1),

        // Public origin of the app, used to build absolute callback URLs.
        APP_URL: z.string().min(1),

        // Cloudflare R2 object storage credentials (accessed via the S3 API).
        AWS_REGION: z.string().min(1),
        R2_ACCOUNT_ID: z.string().min(1),
        R2_ACCESS_KEY_ID: z.string().min(1),
        R2_SECRET_ACCESS_KEY: z.string().min(1),
        R2_BUCKET_NAME: z.string().min(1),

        // chatterbox TTS inference service endpoint and its API key.
        CHATTERBOX_API_URL: z.url(),
        CHATTERBOX_API_KEY: z.string().min(1),
    },
    // No client-exposed variables are declared; everything here is server-only.
    experimental__runtimeEnv: {},
    // Allows CI/build steps that don't need real secrets to skip validation.
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});