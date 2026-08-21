/**
 * -----------------------------------------------------------------------------
 * VoiceCard
 * -----------------------------------------------------------------------------
 * Single voice tile in the voices grid: shows avatar, name, category,
 * description, and language, plus playback of the voice's sample audio and a
 * context menu ("Use this voice" deep-link into the TTS page; delete for
 * custom voices). It is the leaf presentation unit used by VoicesList.
 *
 * Audio streams from the Route Handler `GET /api/voices/[voiceId]`, which
 * proxies the sample out of R2 — the card only needs to build the URL.
 * Deletion goes through the `trpc.voices.delete` mutation (which also removes
 * the R2 object) and invalidates the `voices.getAll` query so all lists
 * refetch. Only CUSTOM-variant voices expose delete; system voices cannot be
 * removed.
 */
import Link from "next/link";
import { Mic, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";

import { useTRPC } from "@/trpc/client";
import { useState } from "react";
import { useAudioPlayback } from "@/hooks/use-audio-playback";

/**
 * A single voice as returned by the `trpc.voices.getAll` procedure (custom
 * section). Inferred from the router output so the card's props always match
 * the server contract without hand-written types.
 */
export type VoiceItem =
    inferRouterOutputs<AppRouter>["voices"]["getAll"]["custom"][number];

/** Props for {@link VoiceCard}. */
interface VoiceCardProps {
    /** The voice record to render. */
    voice: VoiceItem;
};

// Reused formatter that turns ISO country codes into English region names.
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/**
 * Derives a flag emoji and readable region name from a BCP-47 locale tag.
 *
 * @param locale - Locale tag such as "en-US"; the country subtag drives both
 *   outputs.
 * @returns `flag` (regional-indicator emoji built from the country code) and
 *   `region` (human-readable name like "United States"); empty flag when no
 *   country subtag exists.
 */
function parseLanguage(locale: string) {
    const [, country] = locale.split("-");
    if (!country) return { flag: "", region: locale };

    // Each uppercase letter maps onto the Unicode regional-indicator symbol
    // block (U+1F1E6..), producing a two-letter flag emoji.
    const flag = [...country.toUpperCase()]
        .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
        .join("");

    const region = regionNames.of(country) ?? country;

    return { flag, region };
};

/**
 * Renders one voice with playback, navigation, and delete actions.
 *
 * @param voice - The voice item to display.
 * @returns The card markup, including the delete confirmation dialog for
 *   custom voices.
 */
export function VoiceCard({ voice }: VoiceCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { flag, region } = parseLanguage(voice.language);

    // Sample audio is served by the /api/voices/[voiceId] route handler,
    // which fetches the object from R2 on demand.
    const audioSrc = `/api/voices/${encodeURIComponent(voice.id)}`;
    const { isPlaying, isLoading, togglePlay } = useAudioPlayback(audioSrc);

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation(
        trpc.voices.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Voice deleted successfully");
                // Refetch every voices.getAll consumer so both list sections
                // drop the deleted voice without manual state juggling.
                queryClient.invalidateQueries({
                    queryKey: trpc.voices.getAll.queryKey(),
                });
            },
            onError: (error) => {
                toast.error(error.message ?? "Failed to delete voice");
            },
        }),
    );

    return (
        <div className="flex items-center gap-1 overflow-hidden rounded-xl border pr-3 lg:pr-6">
            <div className="relative h-24 w-20 shrink-0 lg:h-30 lg:w-24">
                <div className="absolute left-0 top-0 h-24 w-10 border-r bg-muted/50 lg:h-30 lg:w-12" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <VoiceAvatar
                        seed={voice.id}
                        name={voice.name}
                        className="size-14 border-[1.5px] border-white shadow-xs lg:size-18"
                    />
                </div>

            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:gap-3">
                <div className="flex items-center gap-1.5 line-clamp-1 text-sm font-medium tracking-tight">
                    {voice.name}
                    <span className="size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                    <span className="text-[#327c88]">
                        {VOICE_CATEGORY_LABELS[voice.category]}
                    </span>
                </div>

                <p className="line-clamp-1 text-xs text-muted-foreground">
                    {voice.description}
                </p>

                <p className="flex items-center gap-1 text-xs">
                    <span className="shrink-0">{flag}</span>
                    <span className="truncate font-medium">{region}</span>
                </p>
            </div>

            <div className="ml-1 flex shrink-0 items-center gap-1 lg:ml-3 lg:gap-2">
                <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full"
                    onClick={togglePlay}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Spinner className="size-4" />
                    ) : isPlaying ? (
                        <Pause className="size-4" />
                    ) : (
                        <Play className="size-4" />
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            className="rounded-full"
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/text-to-speech?voiceId=${voice.id}`}>
                                <Mic className="size-4 text-foreground" />
                                <span className="font-medium">Use this voice</span>
                            </Link>
                        </DropdownMenuItem>
                        {/* Only user-created voices may be deleted; system
                            voices are part of the platform catalog. */}
                        {voice.variant === "CUSTOM" && (
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="size-4 text-destructive" />
                                <span className="font-medium">Delete voice</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {voice.variant === "CUSTOM" && (
                    <AlertDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete voice</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{voice.name}&quot;? This
                                    action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleteMutation.isPending}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    disabled={deleteMutation.isPending}
                                    onClick={(e) => {
                                        // Prevent the action's default behavior so the
                                        // dialog stays open while the mutation runs and
                                        // closes only on success below.
                                        e.preventDefault();
                                        deleteMutation.mutate(
                                            { id: voice.id },
                                            { onSuccess: () => setShowDeleteDialog(false) },
                                        );
                                    }}
                                >
                                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
};