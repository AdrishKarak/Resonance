/**
 * -----------------------------------------------------------------------------
 * tRPC client-side provider (browser)
 * -----------------------------------------------------------------------------
 * Sets up the React bindings for tRPC on the client: the typed context hooks
 * (`TRPCProvider`, `useTRPC`) and the `TRPCReactProvider` component that wraps
 * the app in `src/app/layout.tsx`. It pairs with `server.tsx`, which handles
 * the server-rendered side (prefetching/hydration); both share
 * `query-client.ts` and the `AppRouter` type so client calls stay end-to-end
 * type-safe.
 *
 * Requests are batched over HTTP with superjson as the wire transformer,
 * matching the transformer configured in `init.ts`.
 */
'use client';

// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import superjson from "superjson";
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

// Typed hooks consumed throughout feature components (e.g. `useTRPC(...)`).
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;
function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient();
    }
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

function getUrl() {
    const base = (() => {
        if (typeof window !== 'undefined') return '';
        if (process.env.APP_URL) return process.env.APP_URL;
        return 'http://localhost:3000';
    })();
    return `${base}/api/trpc`;
}

/**
 * Root provider that wires React Query and the tRPC client into the React tree.
 *
 * @param props.children - The app subtree allowed to call `useTRPC()`.
 * @returns The nested QueryClient + TRPC providers.
 */
export function TRPCReactProvider(
    props: Readonly<{
        children: React.ReactNode;
    }>,
) {
    // NOTE: Avoid useState when initializing the query client if you don't
    //       have a suspense boundary between this and the code that may
    //       suspend because React will throw away the client on the initial
    //       render if it suspends and there is no boundary
    const queryClient = getQueryClient();

    // useState initializer keeps the tRPC client stable across re-renders.
    const [trpcClient] = useState(() =>
        createTRPCClient<AppRouter>({
            links: [
                httpBatchLink({
                    transformer: superjson, //<-- if you use a data transformer
                    url: getUrl(),
                }),
            ],
        }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}