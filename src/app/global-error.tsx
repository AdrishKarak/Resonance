/**
 * -----------------------------------------------------------------------------
 * Global Error Boundary
 * -----------------------------------------------------------------------------
 * The last-resort error boundary for the entire App Router. Next.js renders
 * this component when an error escapes all nested `error.tsx` boundaries —
 * including errors thrown in the root layout itself. Because it replaces the
 * whole document, it must render its own <html> and <body> tags. It reports
 * every uncaught error to Sentry so failures are observable in production,
 * then shows Next.js's generic error page to the user.
 */
"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * GlobalError captures the thrown error and reports it to Sentry.
 *
 * @param error - The error that escaped all lower-level error boundaries;
 *   `digest` may be present for server-side errors.
 * @returns A minimal standalone HTML document with a generic error page.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // Report the error exactly once per error instance (effect deps handle dedupe
  // across re-renders) so the issue appears in Sentry with its stack trace.
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
