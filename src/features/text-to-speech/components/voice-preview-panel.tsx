"use client";

/**
 * -----------------------------------------------------------------------------
 * Voice preview panel
 * -----------------------------------------------------------------------------
 * Desktop audio playback view for a completed generation, rendered by
 * TextToSpeechDetailView (its mobile counterpart is VoicePreviewMobile). It
 * renders an interactive waveform via the useWaveSurfer hook, play/pause and
 * ±10s seek controls, a time readout, voice metadata, and a client-side
 * download of the generated WAV from its R2-backed URL.
 */
import { useState } from "react";
import { Pause, Play, Download, Redo, Undo } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useWaveSurfer } from "../hooks/use-wavesurfer";



/**
 * Minimal voice shape needed for the preview footer metadata.
 */
type VoicePreviewPanelVoice = {
    id?: string;
    name: string;
};

/**
 * Formats seconds as a zero-padded "MM:SS" string.
 *
 * @param seconds - Elapsed or total time in seconds.
 * @returns The formatted time label.
 */
function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Renders the waveform player for a generated audio file.
 *
 * @param props.audioUrl - URL of the WAV file (served from Cloudflare R2) to
 * load into the WaveSurfer instance.
 * @param props.voice - The voice used for the generation, shown in the footer
 * metadata; null when unknown.
 * @param props.text - The source text, used both as displayed metadata and to
 * derive the download filename.
 * @returns The voice preview panel element.
 */
export function VoicePreviewPanel({
    audioUrl,
    voice,
    text,
}: {
    audioUrl: string;
    voice: VoicePreviewPanelVoice | null;
    text: string;
}) {
    const [isDownloading, setIsDownloading] = useState(false);
    const selectedVoiceName = voice?.name ?? null;
    const selectedVoiceSeed = voice?.id ?? null;

    // Waveform lifecycle (create/load/destroy) is fully managed by the hook;
    // autoplay starts playback as soon as the audio is decoded
    const {
        containerRef,
        isPlaying,
        isReady,
        currentTime,
        duration,
        togglePlayPause,
        seekBackward,
        seekForward,
    } = useWaveSurfer({
        url: audioUrl,
        autoplay: true,
    });

    const handleDownload = () => {
        setIsDownloading(true);

        // Derive a filesystem-safe filename from the first 50 chars of the text,
        // falling back to "speech" when nothing usable remains
        const safeName =
            text
                .slice(0, 50)
                .trim()
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase() || "speech";

        const link = document.createElement("a");
        link.href = audioUrl;
        link.download = `${safeName}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Keep the button disabled briefly so rapid clicks don't stack downloads
        setTimeout(() => setIsDownloading(false), 1000);
    };

    return (
        <div className="h-full gap-8 flex-col border-t hidden flex-1 lg:flex">
            {/* Header */}
            <div className="p-6 pb-0">
                <h3 className="font-semibold text-foreground">Voice preview</h3>
            </div>

            {/* Content */}
            <div className="relative flex flex-1 items-center justify-center">
                {!isReady && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <Badge
                            variant="outline"
                            className="gap-2 bg-background/90 px-3 py-1.5 text-sm text-muted-foreground shadow-sm"
                        >
                            <Spinner className="size-4" />
                            <span>Loading audio...</span>
                        </Badge>
                    </div>
                )}
                {/* Waveform container; kept invisible (not unmounted) until
                    WaveSurfer reports ready so the hook's ref stays attached */}
                <div
                    ref={containerRef}
                    className={cn(
                        "w-full cursor-pointer transition-opacity duration-200",
                        !isReady && "opacity-0",
                    )}
                />
            </div>
            {/* Time display */}
            <div className="flex items-center justify-center">
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                    {formatTime(currentTime)}&nbsp;
                    <span className="text-muted-foreground">
                        /&nbsp;{formatTime(duration)}
                    </span>
                </p>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center p-6">
                <div className="grid w-full grid-cols-3">
                    {/* Metadata */}
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium text-foreground">
                            {text}
                        </p>
                        {selectedVoiceName && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <VoiceAvatar
                                    seed={selectedVoiceSeed ?? selectedVoiceName}
                                    name={selectedVoiceName}
                                    className="shrink-0"
                                />
                                <span className="truncate">{selectedVoiceName}</span>
                            </div>
                        )}
                    </div>

                    {/* Player controls */}
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="flex-col"
                            onClick={() => seekBackward(10)}
                            disabled={!isReady}
                        >
                            <Undo className="size-4 -mb-1" />
                            <span className="text-[10px] font-medium">10</span>
                        </Button>

                        <Button
                            variant="default"
                            size="icon-lg"
                            className="rounded-full"
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? (
                                <Pause className="fill-background" />
                            ) : (
                                <Play className="fill-background" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="flex-col"
                            onClick={() => seekForward(10)}
                            disabled={!isReady}
                        >
                            <Redo className="size-4 -mb-1" />
                            <span className="text-[10px] font-medium">10</span>
                        </Button>
                    </div>

                    {/* Download */}
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={isDownloading}
                        >
                            <Download className="size-4" />
                            Download
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};
