/**
 * -----------------------------------------------------------------------------
 * VoicesList
 * -----------------------------------------------------------------------------
 * Presentational section that renders a titled, responsive grid of voice
 * cards, or a friendly empty state when the section has no voices. It exists
 * so voices-view.tsx can render both libraries ("Team Voices" and "Built-in
 * Voices") with identical layout/empty-state treatment.
 *
 * Receives already-fetched voice data from the parent (which queries
 * `trpc.voices.getAll`) and delegates each entry to VoiceCard; it holds no
 * data-fetching or mutation logic of its own.
 */
import { AudioLines, Mic, Volume2 } from "lucide-react";

import { VoiceCard } from "./voice-card";
import type { VoiceItem } from "./voice-card";

/** Props for {@link VoicesList}. */
interface VoicesListProps {
    /** Section heading, e.g. "Team Voices" or "Built-in Voices". */
    title: string;
    /** Voices to render; an empty array shows the empty state. */
    voices: VoiceItem[];
}

/**
 * Renders a titled grid of voice cards or an illustrated empty state.
 *
 * @param title - Heading shown above the grid (also used in empty-state copy).
 * @param voices - Voice items fetched via `trpc.voices.getAll`.
 * @returns The section markup: heading plus card grid, or the empty state.
 */
export function VoicesList({ title, voices }: VoicesListProps) {
    if (!voices.length) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>

                <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <div className="relative flex h-14 w-32 items-center justify-center">

                        <div className="absolute left-0 -rotate-30 rounded-full bg-muted p-4">
                            <Volume2 className="size-5 text-muted-foreground" />
                        </div>

                        <div className="relative z-10 rounded-full bg-foreground p-4">
                            <Mic className="size-5 text-background" />
                        </div>

                        <div className="absolute right-0 rotate-30 rounded-full bg-muted p-4">
                            <AudioLines className="size-5 text-muted-foreground" />
                        </div>

                    </div>

                    <p className="text-lg font-semibold tracking-tight text-foreground">
                        No voices found
                    </p>

                    <p className="max-w-md text-center text-sm text-muted-foreground">
                        {title} will appear here
                    </p>
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {voices.map((voice) => (
                    <VoiceCard key={voice.id} voice={voice} />
                ))}
            </div>
        </div>
    );
};