/**
 * -----------------------------------------------------------------------------
 * Sentry server instrumentation hook
 * -----------------------------------------------------------------------------
 * Next.js lifecycle file: `register()` runs once when the server process
 * boots (and on the edge runtime), initializing the correct Sentry config
 * for the current runtime. It exists so all server-side errors, traces, and
 * tRPC spans (see the Sentry middleware in `src/trpc/init.ts`) are captured.
 *
 * The exported `onRequestError` wires Next.js framework errors (rendering,
 * routing) into Sentry automatically.
 */
import * as Sentry from "@sentry/nextjs";

/**
 * Called by Next.js at server startup to initialize observability.
 *
 * Loads only the config matching the active runtime, since Sentry server and
 * edge SDKs have different requirements.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Forward Next.js request errors (RSC/render/route failures) to Sentry.
export const onRequestError = Sentry.captureRequestError;
