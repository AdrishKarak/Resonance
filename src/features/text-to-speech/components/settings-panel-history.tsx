"use client";

/**
 * -----------------------------------------------------------------------------
 * Settings panel history list
 * -----------------------------------------------------------------------------
 * Renders the user's past TTS generations, fetched via the `generations.getAll`
 * tRPC procedure. Shown in two places: as the "History" tab inside the desktop
 * SettingsPanel, and inside the mobile HistoryDrawer. Each entry links to the
 * generation's detail page (/text-to-speech/[id]); an empty state is displayed
 * when no generations exist yet.
 */
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AudioLines, AudioWaveform, Clock } from "lucide-react";
import Link from "next/link";

/**
 * Lists all of the current user's generations with voice metadata and relative
 * timestamps, or a friendly empty state when there is nothing to show.
 *
 * @returns A scrollable list of generation links, or the empty-state illustration.
 */
export function SettingsPanelHistory() {
    const trpc = useTRPC();

    const { data: generations } = useSuspenseQuery(
        trpc.generations.getAll.queryOptions(),
    );

    // Empty state shown before the user has generated any audio
    if (!generations.length) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8">
                <div className="relative flex w-25 items-center justify-center">

                    <div className="absolute left-0 -rotate-30 rounded-full bg-muted p-3">
                        <AudioLines className="size-4 text-muted-foreground" />
                    </div>

                    <div className="relative z-10 rounded-full bg-foreground p-3">
                        <AudioWaveform className="size-4 text-background" />
                    </div>

                    <div className="absolute right-0 rotate-30 rounded-full bg-muted p-3">
                        <Clock className="size-4 text-muted-foreground" />
                    </div>

                </div>
                <p className="font-semibold tracking-tight text-foreground">
                    No generations yet
                </p>
                <p className="max-w-48 text-center text-xs text-muted-foreground">
                    Generate some audio and it will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 p-2">
            {generations.map((generation) => (
                // Each row navigates to the generation's detail workspace
                <Link
                    href={`/text-to-speech/${generation.id}`}
                    key={generation.id}
                    className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium text-foreground">
                            {generation.text}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <VoiceAvatar
                                seed={generation.voiceId ?? generation.voiceName}
                                name={generation.voiceName}
                                className="shrink-0"
                            />
                            <span>{generation.voiceName}</span>
                            <span>&middot;</span>
                            <span>
                                {formatDistanceToNow(
                                    new Date(generation.createdAt),
                                    {
                                        addSuffix: true,
                                    },
                                )}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
};