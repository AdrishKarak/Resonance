import { useState, useRef, useCallback, useEffect } from "react";
import type RecordRTCType from "recordrtc";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

/**
 * -----------------------------------------------------------------------------
 * useAudioRecorder
 * -----------------------------------------------------------------------------
 * Client hook encapsulating the full microphone-capture lifecycle used by the
 * "Record" tab of the custom voice creation flow (voice-recorder.tsx). It
 * manages: requesting mic permission, recording WAV audio via RecordRTC,
 * rendering a live scrolling waveform via WaveSurfer's record plugin, an
 * elapsed-time timer, and deterministic cleanup of every resource it opens.
 *
 * It exists so the recorder UI stays declarative — components only see state
 * (`isRecording`, `audioBlob`, `error`) and three imperative actions — while
 * all MediaStream/encoder teardown lives in one place. The resulting Blob is
 * wrapped into a `File` by voice-recorder.tsx and fed into the same form field
 * as uploaded files, so downstream submission to `/api/voices/create` is
 * identical for recorded and uploaded audio.
 *
 * @returns Recording state and control functions (see individual fields).
 */
export function useAudioRecorder() {
    // True while the recorder is actively capturing audio.
    const [isRecording, setIsRecording] = useState(false);
    // Seconds elapsed since recording started, updated ~10x per second.
    const [elapsedTime, setElapsedTime] = useState(0);
    // The completed recording, set once stopRecording's callback fires.
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    // Human-readable failure message (e.g. permission denied) or null.
    const [error, setError] = useState<string | null>(null);

    // RecordRTC encoder instance; created lazily on start, destroyed on cleanup.
    const recorderRef = useRef<RecordRTCType | null>(null);
    // The getUserMedia stream; kept so its tracks can be stopped to release the mic.
    const streamRef = useRef<MediaStream | null>(null);
    // Interval handle driving the elapsed-time display.
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // DOM node where WaveSurfer renders the live waveform (attached by the consumer).
    const containerRef = useRef<HTMLDivElement>(null);
    // WaveSurfer instance visualizing the mic input while recording.
    const wsRef = useRef<WaveSurfer | null>(null);
    // Handle returned by renderMicStream; must be destroyed before WaveSurfer itself.
    const micStreamRef = useRef<{ onDestroy: () => void } | null>(null);

    /**
     * Tears down the waveform visualization. The mic-stream handle must be
     * destroyed first, otherwise WaveSurfer's destroy can leave the plugin
     * holding a reference to a dead audio graph.
     */
    const destroyWaveSurfer = useCallback(() => {
        if (micStreamRef.current) {
            micStreamRef.current.onDestroy();
            micStreamRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.destroy();
            wsRef.current = null;
        }
    }, []);

    /**
     * Releases every resource opened during a recording session: the timer,
     * the RecordRTC encoder, and the underlying MediaStream tracks (which is
     * what actually turns off the browser's microphone indicator), then the
     * waveform. Safe to call multiple times thanks to the null guards.
     */
    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (recorderRef.current) {
            recorderRef.current.destroy();
            recorderRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        destroyWaveSurfer();
    }, [destroyWaveSurfer]);

    // Mounts/destroys the live waveform whenever recording starts/stops.
    // Runs as an effect (not inline in startRecording) because containerRef
    // only points at rendered DOM once `isRecording` flips the UI.
    useEffect(() => {
        if (!isRecording || !containerRef.current || !streamRef.current) return;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: "hsl(var(--foreground) / 0.5)",
            height: 144,
            barWidth: 1,
            barGap: 2,
            barRadius: 1,
            cursorWidth: 0,
            barMinHeight: 10,
            barHeight: 2,
            normalize: true,
        });

        wsRef.current = ws

        // Scrolling waveform gives real-time feedback that capture is working.
        const record = ws.registerPlugin(
            RecordPlugin.create({
                scrollingWaveform: true,
            }),
        );

        // Feed the already-open mic stream into WaveSurfer purely for
        // visualization; actual encoding stays with RecordRTC.
        const handle = record.renderMicStream(streamRef.current);
        micStreamRef.current = handle;

        return () => {
            destroyWaveSurfer();
        };
    }, [isRecording, destroyWaveSurfer]);

    /**
     * Requests microphone access and begins recording.
     *
     * Dynamically imports RecordRTC so its weight is not paid on pages that
     * never open the recorder. Configured for mono 44.1 kHz WAV — a format the
     * TTS cloning backend accepts directly, avoiding any client-side
     * transcoding. Also resets prior results and starts the elapsed timer.
     * Permission failures are surfaced via `error` instead of throwing.
     */
    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setAudioBlob(null);
            setElapsedTime(0);

            // Ask for mic access first; this is what triggers the browser
            // permission prompt and can reject with NotAllowedError.
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            streamRef.current = stream;

            const { default: RecordRTC, StereoAudioRecorder } = await import(
                "recordrtc"
            );

            const recorder = new RecordRTC(stream, {
                recorderType: StereoAudioRecorder,
                mimeType: "audio/wav",
                numberOfAudioChannels: 1,
                desiredSampRate: 44100,
            });

            recorderRef.current = recorder;
            recorder.startRecording();
            setIsRecording(true);

            // Poll Date.now() rather than incrementing a counter so the timer
            // stays accurate even if intervals are throttled/delayed.
            const startTime = Date.now();
            timerRef.current = setInterval(() => {
                setElapsedTime((Date.now() - startTime) / 1000);
            }, 100);
        } catch (err) {
            // Partial setup may have opened a stream/timer; release everything.
            cleanup();

            if (err instanceof DOMException && err.name === "NotAllowedError") {
                setError(
                    "Microphone access denied. Please allow microphone access in your browser settings.",
                );
            } else {
                setError("Failed to access microphone. Please check your device.");
            }
        }
    }, [cleanup]);

    /**
     * Stops the active recording and hands the finished blob to the caller.
     *
     * @param onBlob - Optional callback invoked with the encoded WAV blob once
     *   RecordRTC finishes finalizing it. Called after state updates so the
     *   consumer (voice-recorder.tsx) can wrap the blob in a File and push it
     *   into the form in the same tick.
     */
    const stopRecording = useCallback(
        (onBlob?: (blob: Blob) => void) => {
            const recorder = recorderRef.current;
            if (!recorder) return;

            recorder.stopRecording(() => {
                const blob = recorder.getBlob();
                setAudioBlob(blob);
                setIsRecording(false);
                cleanup();
                onBlob?.(blob);
            });
        },
        [cleanup],
    );

    /**
     * Discards the current recording entirely: stops any active session,
     * clears the captured blob, timer, and error, returning the hook to its
     * initial state. Used by the "Re-record"/"Remove" actions.
     */
    const resetRecording = useCallback(() => {
        cleanup();
        setIsRecording(false);
        setElapsedTime(0);
        setAudioBlob(null);
        setError(null);
    }, [cleanup]);

    return {
        isRecording,
        elapsedTime,
        audioBlob,
        containerRef,
        error,
        startRecording,
        stopRecording,
        resetRecording,
    };
};
