import type { Metadata } from "next";
import { TextToSpeechView } from "@/features/text-to-speech/views/text-to-speech-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

export const metadata: Metadata = { title: "Text to Speech | Sonic" };

/**
 * -----------------------------------------------------------------------------
 * Text-to-Speech Studio Page
 * -----------------------------------------------------------------------------
 * The main TTS workspace at `/text-to-speech` where users compose text, pick a
 * voice, and trigger speech generation. It exists as the core product
 * surface; the dashboard sidebar links here, and generation rows elsewhere in
 * the app deep-link back with `?text=` and `?voiceId=` query params to
 * pre-fill the editor. The page server-side prefetches the voice list and the
 * user's generation history so the client hydrates with data already present,
 * avoiding loading spinners on first paint.
 */
/**
 * TextToSpeechPage prefetches TTS data on the server and renders the studio.
 *
 * @param searchParams - Optional `text` and `voiceId` URL params used to
 *   pre-populate the editor (e.g. when arriving from a "reuse voice" link).
 * @returns The hydrated TextToSpeechView with prefetched voices/generations.
 */
export default async function TextToSpeechPage({
    searchParams,
}: {
    searchParams: Promise<{ text?: string; voiceId?: string }>;
}) {
    // searchParams is a Promise in Next.js 15+/16 and must be awaited.
    const { text, voiceId } = await searchParams;

    // Server-side tRPC prefetch: these queries are dehydrated into the RSC
    // payload and rehydrated by HydrateClient, so useSuspenseQuery in the
    // view resolves instantly without a client-side fetch round trip.
    prefetch(trpc.voices.getAll.queryOptions());
    prefetch(trpc.generations.getAll.queryOptions());

    return (
        <HydrateClient>
            <TextToSpeechView initialValues={{ text, voiceId }} />
        </HydrateClient>
    );
};
