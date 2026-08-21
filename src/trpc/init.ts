/**
 * -----------------------------------------------------------------------------
 * tRPC initialization, middleware, and procedure guards
 * -----------------------------------------------------------------------------
 * The foundation of the API layer: creates the tRPC instance (with superjson
 * as the shared wire transformer), attaches Sentry instrumentation to every
 * procedure, and defines the authorization ladder used by all routers:
 *
 *   baseProcedure  -> no auth, Sentry tracing only
 *   authProcedure  -> requires a signed-in Clerk user; injects `ctx.userId`
 *   orgProcedure   -> requires an active org; injects `ctx.userId` + `ctx.orgId`
 *
 * Every router in `src/trpc/routers/` builds on `createTRPCRouter` and almost
 * exclusively uses `orgProcedure`, since all app data (voices, generations,
 * billing) is scoped per organization.
 */
import * as Sentry from "@sentry/node";
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from "superjson";
// React `cache` deduplicates context creation within a single request pass.
export const createTRPCContext = cache(async () => {
    return {};
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({

    // Must match the client-side transformer (see trpc/client.tsx).
    transformer: superjson,
});

const sentryMiddleware = t.middleware(
    Sentry.trpcMiddleware({
        attachRpcInput: true,
    }),
);

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(sentryMiddleware);

// Authenticated procedure - calls auth() only when needed
export const authProcedure = baseProcedure.use(async ({ next }) => {
    // Resolve the Clerk session; reject unauthenticated callers up front.
    const { userId } = await auth();

    if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
        ctx: { userId },
    });
});

// Organization procedure - requires userId and orgId
export const orgProcedure = baseProcedure.use(async ({ next }) => {
    // Requires both a signed-in user AND an active organization context,
    // since all data is keyed by orgId. Users without an org are redirected
    // to /org-selection by the proxy middleware before reaching here.
    const { userId, orgId } = await auth();

    if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (!orgId) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Organization required",
        });
    }

    return next({ ctx: { userId, orgId } });
});