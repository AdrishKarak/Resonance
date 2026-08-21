import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

import { prefetch, trpc, HydrateClient } from "@/trpc/server";

import { VoicesView } from "@/features/voices/views/voices-view";
import { voicesSearchParamsCache } from "@/features/voices/lib/params";

export const metadata: Metadata = { title: "Voices | Sonic" };

/**
 * -----------------------------------------------------------------------------
 * Voices Library Page
 * -----------------------------------------------------------------------------
 * The voice library at `/voices`, listing all system and custom (cloned)
 * voices available to the active organization. It exists as the browsing and
 * management surface for voices; the dashboard sidebar links here, and users
 * can preview audio or jump into the TTS studio with a selected voice. URL
 * search params (e.g. `query`) are parsed with nuqs' server-side cache so
 * filtering state is shareable and type-safe. The page prefetches the voice
 * list server-side so the grid renders immediately after hydration.
 */
/**
 * VoicesPage parses search params, prefetches voices, and hydrates the view.
 *
 * @param searchParams - Raw URL search params (parsed via nuqs), supporting a
 *   `query` filter for searching the voice library.
 * @returns The hydrated VoicesView with prefetched voice data.
 */
export default async function VoicesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    // nuqs validates/coerces the raw params against the shared schema used by
    // the client hooks, keeping client and server filter state in sync.
    const { query } = await voicesSearchParamsCache.parse(searchParams);
    // Server-side tRPC prefetch: dehydrates the filtered voice list into the
    // RSC payload so HydrateClient serves it without a client round trip.
    prefetch(trpc.voices.getAll.queryOptions({ query }));
    return (
        <HydrateClient>
            <VoicesView />
        </HydrateClient>
    );
}
