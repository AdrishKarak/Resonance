/**
 * -----------------------------------------------------------------------------
 * chatterbox TTS API client
 * -----------------------------------------------------------------------------
 * Typed HTTP client for the external chatterbox text-to-speech inference
 * service, generated from its OpenAPI schema (`@/types/chatterbox-api`) via
 * openapi-fetch. It exists so every call to the TTS service is fully typed
 * and authenticated in one place — currently the only consumer is the
 * `create` mutation in `src/trpc/routers/generations.ts`, which POSTs to
 * `/generate` and receives raw WAV bytes.
 */
import createClient from "openapi-fetch";
import type { paths } from "@/types/chatterbox-api";
import { env } from "./env";

// Pre-configured client: base URL and API key come from validated server env.
export const chatterbox = createClient<paths>({
    baseUrl: env.CHATTERBOX_API_URL,
    headers: {
        "x-api-key": env.CHATTERBOX_API_KEY,
    },
});