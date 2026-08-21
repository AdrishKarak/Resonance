/**
 * -----------------------------------------------------------------------------
 * Edge middleware: auth & organization routing (Clerk)
 * -----------------------------------------------------------------------------
 * Next.js middleware (named proxy.ts per Clerk's convention) that runs before
 * every matched request to enforce the app's routing invariants:
 *
 *   1. Public routes (landing, sign-in/up, Clerk webhook) pass through.
 *   2. Unauthenticated visitors hitting "/" are redirected to /landing;
 *      all other protected routes go through Clerk's `auth.protect()`.
 *   3. Authenticated users without an active organization are forced to
 *      /org-selection — this guarantees the `orgId` that every tRPC
 *      `orgProcedure` and data query depends on is always present.
 *
 * It works hand-in-hand with `src/trpc/init.ts`, which re-checks auth
 * server-side for API calls.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


// Routes accessible without authentication.
const isPublicRoute = createRouteMatcher([
    "/landing",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks/clerk-webhook",
]);

// The org picker must stay reachable for signed-in users who have no org yet.
const isOrgSelectionRoute = createRouteMatcher([
    "/org-selection(.*)"
]);


export default clerkMiddleware(async (auth, req) => {
    const { userId, orgId } = await auth();

    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    if (!userId) {
        // Root path gets a friendly redirect instead of a sign-in bounce.
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "") {
            return NextResponse.redirect(new URL("/landing", req.url));
        }
        // Everything else requires sign-in; Clerk handles the redirect.
        await auth.protect();
    }

    if (isOrgSelectionRoute(req)) {
        return NextResponse.next()
    }

    // Signed in but no active org: force org selection so downstream
    // code can always rely on an orgId context.
    if (userId && !orgId) {
        const orgSelectionUrl = new URL(`/org-selection`, req.url);
        return NextResponse.redirect(orgSelectionUrl);
    }

    return NextResponse.next()
});

// Run on all pages except static assets, plus all /api and /trpc routes.
export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};  