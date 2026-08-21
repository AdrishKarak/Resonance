
/**
 * -----------------------------------------------------------------------------
 * Generation Detail Page
 * -----------------------------------------------------------------------------
 * The detail view for a single speech generation at
 * `/text-to-speech/[generationId]`. It exists so users can revisit a specific
 * generation's audio, text, and settings — linked from the generations list
 * in the studio and dashboard. It server-side prefetches the target
 * generation, the voice catalog, and the full generation history so the
 * client component renders with data already hydrated (no fetch waterfall),
 * then delegates rendering to `TextToSpeechDetailView`.
 */
import { TextToSpeechDetailView } from "@/features/text-to-speech/views/text-to-speech-detail-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

/**
 * TextToSpeechDetailPage prefetches one generation plus supporting lists on
 * the server before hydrating the detail view.
 *
 * @param params - Route params containing the `generationId` path segment.
 * @returns The hydrated TextToSpeechDetailView for the requested generation.
 */
export default async function TextToSpeechDetailPage({
    params,
}: {
    params: Promise<{ generationId: string }>;
}) {
    // Params are a Promise in Next.js 15+/16 and must be awaited.
    const { generationId } = await params;

    // Server-side tRPC prefetch: dehydrates all three queries into the RSC
    // payload so HydrateClient rehydrates them instantly on the client.
    // getById is scoped to the active org by the procedure, so cross-org
    // access yields a not-found state rather than leaked data.
    prefetch(trpc.generations.getById.queryOptions({ id: generationId }));
    prefetch(trpc.voices.getAll.queryOptions());
    prefetch(trpc.generations.getAll.queryOptions());

    return (
        <HydrateClient>
            <TextToSpeechDetailView generationId={generationId} />
        </HydrateClient>
    );
};