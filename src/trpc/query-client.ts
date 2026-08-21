/**
 * -----------------------------------------------------------------------------
 * React Query client factory
 * -----------------------------------------------------------------------------
 * Creates the TanStack QueryClient with defaults shared by both the server
 * (`trpc/server.tsx`) and the browser (`trpc/client.tsx`). It exists as a
 * factory (not a singleton) because the two environments need different
 * lifetimes: the server makes one per request, the browser keeps exactly one.
 *
 * The dehydrate/hydrate options are what enable SSR streaming: pending
 * queries are serialized with superjson on the server and deserialized in
 * the browser, matching tRPC's wire format.
 */
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';

/**
 * Builds a new QueryClient with app-wide defaults.
 *
 * @returns A fresh QueryClient; callers decide its lifetime (per request vs
 *   per browser session).
 */
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Avoid immediate refetches after SSR hydration and during
                // quick remounts within half a minute.
                staleTime: 30 * 1000,
            },
            dehydrate: {
                serializeData: superjson.serialize,
                // Also serialize queries that are still in flight so streamed
                // SSR data isn't lost between server render and hydration.
                shouldDehydrateQuery: (query) =>
                    defaultShouldDehydrateQuery(query) ||
                    query.state.status === 'pending',
            },
            hydrate: {
                deserializeData: superjson.deserialize,
            },
        },
    });
}