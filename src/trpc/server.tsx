/**
 * -----------------------------------------------------------------------------
 * tRPC server-side helpers (RSC prefetch & hydration)
 * -----------------------------------------------------------------------------
 * The server-rendering counterpart to `client.tsx`. It exposes a
 * request-scoped tRPC options proxy (`trpc`) that React Server Components use
 * to build typed query options, plus `prefetch()` and `HydrateClient` so data
 * fetched on the server is serialized into the initial HTML and picked up by
 * the client-side React Query cache without refetching.
 *
 * Server components import `trpc`, `prefetch`, and `HydrateClient` from here;
 * the router implementation comes from `routers/_app.ts` directly (in-process,
 * no HTTP hop).
 */
import 'server-only'; // <-- ensure this file cannot be imported from the client

import { createTRPCOptionsProxy, TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

// In-process proxy: calls the router directly with per-request context.
export const trpc = createTRPCOptionsProxy({
    ctx: createTRPCContext,
    router: appRouter,
    queryClient: getQueryClient,
});

// If your router is on a separate server, pass a client:
// createTRPCOptionsProxy<AppRouter>({
//     client: createTRPCClient<AppRouter>({
//         links: [httpLink({ url: '...' })],
//     }),
//     queryClient: getQueryClient,
// });

/**
 * Wraps children in a React Query hydration boundary so server-prefetched
 * queries are transferred to the browser without a client refetch.
 *
 * @param props.children - Server components that called `prefetch()` upstream.
 * @returns A HydrationBoundary wrapping the subtree.
 */
export function HydrateClient(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {props.children}
        </HydrationBoundary>
    );
}

/**
 * Starts fetching a query on the server (fire-and-forget) ahead of rendering.
 *
 * Detects infinite queries (whose options carry `type: "infinite"` in the
 * query key) and routes them to the matching prefetch API.
 *
 * @param queryOptions - Typed options produced by `trpc.<x>.queryOptions(...)`.
 */
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
    queryOptions: T,
) {
    const queryClient = getQueryClient();
    if (queryOptions.queryKey[1]?.type === 'infinite') {
        void queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
        void queryClient.prefetchQuery(queryOptions);
    }
}