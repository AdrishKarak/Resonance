/**
 * -----------------------------------------------------------------------------
 * Root tRPC router & AppRouter type
 * -----------------------------------------------------------------------------
 * Aggregates all feature routers into the single `appRouter` mounted at
 * `/api/trpc` (see `src/app/api/trpc/[trpc]/route.ts`). The exported
 * `AppRouter` type is the contract that powers end-to-end type safety: both
 * the browser client (`trpc/client.tsx`) and the server proxy
 * (`trpc/server.tsx`) are generic over it, so any procedure added here is
 * immediately typed in React components.
 */
import { createTRPCRouter } from '../init';
import { billingRouter } from './billing';
import { generationsRouter } from './generations';
import { voicesRouter } from './voices';

export const appRouter = createTRPCRouter({
    voices: voicesRouter,
    generations: generationsRouter,
    billing: billingRouter,
});

// Inferred type of the full API surface; imported by client/server plumbing.
export type AppRouter = typeof appRouter;