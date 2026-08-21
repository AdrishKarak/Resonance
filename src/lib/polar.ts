/**
 * -----------------------------------------------------------------------------
 * Polar billing SDK client (singleton)
 * -----------------------------------------------------------------------------
 * Exports a single pre-authenticated Polar client used for all billing
 * operations in the app: subscription gating and usage metering in the tRPC
 * routers (`billing.ts`, `generations.ts`) and voice-creation metering in the
 * `/api/voices/create` route.
 *
 * Centralizing it here ensures one SDK instance per process, configured once
 * from validated env vars, with the server target (sandbox vs production)
 * controlled by `POLAR_SERVER`.
 */
import { Polar } from "@polar-sh/sdk";
import { env } from "./env";

export const polar = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: env.POLAR_SERVER,
});