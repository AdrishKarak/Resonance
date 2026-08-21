"use client";

/**
 * -----------------------------------------------------------------------------
 * TTS voices context
 * -----------------------------------------------------------------------------
 * Shares the voice list fetched once by TextToSpeechView (via the
 * `voices.getAll` tRPC procedure) with every panel in the TTS workspace —
 * VoiceSelector, VoiceSelectorButton, and related previews — so children don't
 * each refetch or thread voices through props. Types are derived directly from
 * the tRPC router output to stay in sync with the API.
 */
import { createContext, useContext } from "react";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

/**
 * A single voice item, inferred from the voices.getAll router output.
 */
type TTSVoiceItem =
    inferRouterOutputs<AppRouter>["voices"]["getAll"]["custom"][number];

/**
 * Value exposed by the voices context.
 */
interface TTSVoicesContextValue {
    /** Team-created (custom) voices. */
    customVoices: TTSVoiceItem[];
    /** Built-in (system) voices. */
    systemVoices: TTSVoiceItem[];
    /** Convenience union of custom + system voices. */
    allVoices: TTSVoiceItem[];
};

/**
 * Internal React context; null until a provider is mounted.
 */
const TTSVoicesContext = createContext<TTSVoicesContextValue | null>(null);

/**
 * Provides the voice lists to the TTS workspace subtree.
 *
 * @param props.children - Consumer components.
 * @param props.value - The voice lists to share (custom, system, and combined).
 * @returns The context provider element.
 */
export function TTSVoicesProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: TTSVoicesContextValue;
}) {
    return (
        <TTSVoicesContext.Provider value={value}>
            {children}
        </TTSVoicesContext.Provider>
    );
};

/**
 * Accesses the shared voice lists from the TTS voices context.
 *
 * @returns The custom, system, and combined voice lists.
 * @throws When used outside of a {@link TTSVoicesProvider}.
 */
export function useTTSVoices() {
    const context = useContext(TTSVoicesContext);

    if (!context) {
        throw new Error("useTTSVoices must be used within a TTSVoicesProvider");
    }

    return context;
};