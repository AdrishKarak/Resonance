/**
 * -----------------------------------------------------------------------------
 * VoicesView
 * -----------------------------------------------------------------------------
 * Top-level client view for the Voices page: renders the search toolbar and
 * the two voice libraries ("Team Voices" for the org's custom clones,
 * "Built-in Voices" for system voices). It exists as the composition root of
 * the voices feature, wiring URL search-param state (via nuqs) to data
 * fetching and UI.
 *
 * Data comes from the `trpc.voices.getAll` procedure, whose `query` input is
 * driven by the `query` search param so searches are shareable URLs. The
 * `cloning` param controls the VoiceCreateDialog's open state, letting any
 * component (toolbar button, deep link) open the creation flow by writing to
 * the URL instead of prop drilling.
 */
"use client";

import { useTRPC } from "@/trpc/client";
import { useQueryState } from "nuqs";
import { useSuspenseQuery } from "@tanstack/react-query";

import { VoicesList } from "../components/voices-list";
import { voicesSearchParams } from "../lib/params";
import { VoicesToolbar } from "../components/voices-toolbar";
import { VoiceCreateDialog } from "../components/voice-create-dialog";


/**
 * Inner content that performs the actual data fetching.
 *
 * Split from {@link VoicesView} so it can be rendered inside a Suspense
 * boundary: `useSuspenseQuery` suspends while `trpc.voices.getAll` is in
 * flight, and reading the params here (rather than in the parent) keeps the
 * toolbar interactive during loading.
 */
function VoicesContent() {
    const trpc = useTRPC();
    // Read/write the shared URL params using the same parsers defined server-side.
    const [query] = useQueryState(
        "query",
        voicesSearchParams.query
    );
    const [cloning, setCloning] = useQueryState(
        "cloning",
        voicesSearchParams.cloning
    );
    // Server-side filtered fetch; suspends until voices are available.
    const { data } = useSuspenseQuery(
        trpc.voices.getAll.queryOptions({ query })
    );

    return (
        <>
            {/* Dialog visibility lives in the URL (`?cloning=true`). */}
            <VoiceCreateDialog open={cloning} onOpenChange={setCloning} />
            <VoicesList title="Team Voices" voices={data.custom} />
            <VoicesList title="Built-in Voices" voices={data.system} />
        </>
    );
};

/**
 * Renders the full Voices page shell.
 *
 * @returns The toolbar plus the suspense-bounded voice lists, scrollable
 *   within the app layout provided by VoicesLayout.
 */
export function VoicesView() {
    return (
        <div className="flex-1 space-y-10 overflow-y-auto p-3 lg:p-6">
            <VoicesToolbar />
            <VoicesContent />
        </div>
    );
};