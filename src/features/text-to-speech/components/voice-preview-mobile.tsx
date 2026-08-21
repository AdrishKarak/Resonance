"use client";

/**
 * -----------------------------------------------------------------------------
 * Mobile voice preview
 * -----------------------------------------------------------------------------
 * Compact audio player for generated speech, rendered only on mobile
 * (`lg:hidden`) inside TextToSpeechDetailView. It uses a plain HTMLAudioElement
 * instead of WaveSurfer to keep the mobile footprint light, and provides
 * play/pause, download, and voice metadata. Paired with VoicePreviewPanel,
 * which serves the same role on desktop.
 */
import { useRef, useState, useEffect } from "react";
import { Pause, Play, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Minimal voice descriptor used for avatar rendering and labeling.
 */
type VoicePreviewMobileVoice = {
    /** Optional voice ID, used as the avatar seed when available. */
    id?: string;
    /** Display name of the voice. */
    name: string;
};

/**
 * Renders the mobile playback bar for a generation's audio.
 *
 * @param props.audioUrl - URL of the WAV file to play (R2-backed); empty hides the component.
 * @param props.voice - Voice metadata for the avatar/name row, or null if unknown.
 * @param props.text - The generated text, shown as the title and used for the download filename.
 * @returns The mobile audio player bar, or null when there is no audio.
 */
export function VoicePreviewMobile({
    audioUrl,
    voice,
    text,
}: {
    /** URL of the audio file to stream and download. */
    audioUrl: string;
    /** Voice associated with this generation (may be null). */
    voice: VoicePreviewMobileVoice | null;
    /** Source text used as the display title and download filename basis. */
    text: string;
}) {
    const isMobile = useIsMobile();
    const selectedVoiceName = voice?.name ?? null;
    const selectedVoiceSeed = voice?.id ?? null;

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Sync the isPlaying flag with real audio events and reset playback whenever
    // the audio source changes (e.g. navigating between generations)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("ended", handleEnded);

        // Stop and rewind so switching generations never auto-continues old audio
        audio.pause();
        audio.currentTime = 0;

        return () => {
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [audioUrl]);

    // Safety net: stop playback if the viewport grows past the mobile breakpoint
    useEffect(() => {
        if (!isMobile) {
            audioRef.current?.pause();
        }
    }, [isMobile]);

    /**
     * Toggles between playing and pausing the current audio element.
     */
    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    };

    /**
     * Downloads the audio as a .wav file named after the first 50 characters
     * of the generation text, sanitized into a filesystem-safe slug.
     */
    const handleDownload = () => {
        const safeName =
            text
                .slice(0, 50)
                .trim()
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase() || "speech";

        // Create a temporary anchor to trigger the browser's download behavior
        const link = document.createElement("a");
        link.href = audioUrl;
        link.download = `${safeName}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!audioUrl) return null;

    return (
        <div className="border-t lg:hidden p-4">
            <audio ref={audioRef} src={audioUrl} />
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{text}</p>
                    {selectedVoiceName && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <VoiceAvatar
                                seed={selectedVoiceSeed ?? selectedVoiceName}
                                name={selectedVoiceName}
                                className="shrink-0"
                            />
                            <span className="truncate">{selectedVoiceName}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleDownload}>
                        <Download className="size-4" />
                    </Button>
                    <Button
                        variant="default"
                        size="icon"
                        className="rounded-full"
                        onClick={togglePlayPause}
                    >
                        {isPlaying ? (
                            <Pause className="fill-background" />
                        ) : (
                            <Play className="fill-background" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
