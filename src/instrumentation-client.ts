/**
 * -----------------------------------------------------------------------------
 * Sentry client instrumentation hook
 * -----------------------------------------------------------------------------
 * Next.js lifecycle file for browser-side observability: initializes Sentry
 * in the user's browser to capture client errors, performance traces, and
 * session replays. Complements `instrumentation.ts`, which covers the
 * server/edge runtimes; together they give full-stack error visibility.
 */
// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://76206cbcb51ff9876633ee986cae1a80@o4511399901265920.ingest.de.sentry.io/4511399941439568",

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  // Always capture a replay when an error happens for full debugging context.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

// Hook App Router navigation timings into Sentry performance monitoring.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
