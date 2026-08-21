/**
 * -----------------------------------------------------------------------------
 * VoiceRecorder
 * -----------------------------------------------------------------------------
 * The "Record" tab of the custom voice creation form: a state machine UI that
 * walks the user through idle → recording (with live waveform and timer) →
 * captured file preview, plus an error state when mic access fails. It exists
 * so recorded audio is indistinguishable from uploaded audio downstream —
 * both end up as a `File` on the same form field.
 *
 * Recording itself is delegated to {@link useAudioRecorder} (RecordRTC +
 * WaveSurfer). When a recording stops, the resulting WAV blob is wrapped in a
 * `File` and pushed up via `onFileChange`, feeding the form field validated by
 * `voiceCreateFormSchema` and ultimately POSTed to `/api/voices/create`.
 */
import {
    Mic,
    Square,
    RotateCcw,
    X,
    FileAudio,
    Play,
    Pause,
} from "lucide-react";

import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useAudioRecorder } from "../hooks/use-audio-recorder";


/**
 * Formats a duration in seconds as a zero-padded HH:MM:SS string for the
 * recording timer display.
 */
function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/**
 * Renders the recorder in whichever state applies: error, captured-file
 * preview, live recording, or the idle prompt to start.
 *
 * @param file - The current audio file on the form field (a finished
 *   recording or `null`); presence switches to preview mode.
 * @param onFileChange - Pushes a new File (finished recording) or null
 *   (removed/re-record) back into the form.
 * @param isInvalid - When true, outlines the idle prompt with the destructive
 *   border to reflect the form-level validation error.
 * @returns The markup for the active recorder state.
 */
export function VoiceRecorder({
    file,
    onFileChange,
    isInvalid,
}: {
    file: File | null;
    onFileChange: (file: File | null) => void;
    isInvalid?: boolean;
}) {
    // Playback of the captured file in preview mode.
    const { isPlaying, togglePlay } = useAudioPlayback(file);

    const {
        isRecording,
        elapsedTime,
        audioBlob,
        containerRef,
        error,
        startRecording,
        stopRecording,
        resetRecording,
    } = useAudioRecorder();

    // Wrap the raw WAV blob into a File so it matches what the upload tab
    // produces; the form schema requires a File instance.
    const handleStop = () => {
        stopRecording((blob) => {
            const recordedFile = new File([blob], "recording.wav", {
                type: "audio/wav",
            });
            onFileChange(recordedFile);
        });
    };

    // Discard the current take: clear the form field and reset all recorder
    // state so the user lands back on the idle screen.
    const handleReRecord = () => {
        onFileChange(null);
        resetRecording();
    };

    // Mic permission/hardware failure — offer a retry path.
    if (error) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/50 bg-destructive/5 px-6 py-10">
                <p className="text-center text-sm text-destructive">{error}</p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetRecording}
                >
                    Try again
                </Button>
            </div>
        );
    }

    if (file) {
        return (
            <div className="flex items-center gap-3 rounded-xl border p-4">

                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <FileAudio className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                        {/* Duration is only shown for recordings made here —
                            uploaded files have no elapsed-time data. */}
                        {audioBlob && elapsedTime > 0 && (
                            <>&nbsp;&middot;&nbsp;{formatTime(elapsedTime)}</>
                        )}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={togglePlay}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="size-4" />
                    ) : (
                        <Play className="size-4" />
                    )}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleReRecord}
                    title="Re-record"
                >
                    <RotateCcw className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleReRecord}
                    title="Remove"
                >
                    <X className="size-4" />
                </Button>
            </div>
        );
    }

    // Live recording view: waveform renders into containerRef (read by the
    // hook's effect) alongside the running timer and stop control.
    if (isRecording) {
        return (
            <div className="flex flex-col overflow-hidden rounded-2xl border">
                <div ref={containerRef} className="w-full" />
                <div className="flex items-center justify-between border-t p-4">
                    <p className="text-[28px] font-semibold leading-[1.2] tracking-tight">
                        {formatTime(elapsedTime)}
                    </p>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleStop}
                    >
                        <Square className="size-3" />
                        Stop
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-10",
                isInvalid && "border-destructive",
            )}
        >
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Mic className="size-5 text-muted-foreground" />
            </div>

            <div className="flex flex-col items-center gap-1.5">
                <p className="text-base font-semibold tracking-tight">
                    Record your voice
                </p>
                <p className="text-center text-sm text-muted-foreground">
                    Click record to start capturing audio
                </p>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startRecording}
            >
                <Mic className="size-3.5" />
                Record
            </Button>
        </div>
    );
};