"use client";

/**
 * -----------------------------------------------------------------------------
 * WaveSurfer hook
 * -----------------------------------------------------------------------------
 * Encapsulates the full WaveSurfer.js lifecycle (create, load, event wiring,
 * destroy) for rendering interactive audio waveforms. It exposes playback
 * state (playing/ready/current time/duration) plus play-pause and seek
 * controls, and is consumed by the voice preview panels to play back generated
 * speech from its audio URL.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Options for {@link useWaveSurfer}.
 */
interface UseWaveSurferOptions {
    /** Audio URL to load; the instance is only created when provided. */
    url?: string;
    /** Whether to start playback automatically once the audio is ready. */
    autoplay?: boolean;
    /** Called when the waveform is decoded and ready. */
    onReady?: () => void;
    /** Called on load or playback errors. */
    onError?: (error: Error) => void;
}

/**
 * Return value of {@link useWaveSurfer}.
 */
interface UseWaveSurferReturn {
    /** Ref to attach to the waveform container div. */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /** Whether audio is currently playing. */
    isPlaying: boolean;
    /** Whether the audio has been loaded and decoded. */
    isReady: boolean;
    /** Current playback position in seconds. */
    currentTime: number;
    /** Total duration in seconds. */
    duration: number;
    /** Toggles between play and pause. */
    togglePlayPause: () => void;
    /** Seeks forward by the given seconds (default 5). */
    seekForward: (seconds?: number) => void;
    /** Seeks backward by the given seconds (default 5). */
    seekBackward: (seconds?: number) => void;
}

/**
 * Creates and manages a WaveSurfer instance bound to a container ref.
 *
 * @param options - See {@link UseWaveSurferOptions}.
 * @returns The container ref plus playback state and control callbacks.
 */
export function useWaveSurfer({
    url,
    autoplay,
    onReady,
    onError,
}: UseWaveSurferOptions) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const isMobile = useIsMobile();

    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (!containerRef.current || !url) return;

        // Tear down any previous instance before recreating (e.g. url changed)
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
            wavesurferRef.current = null;
        }

        // Guards against firing onError after unmount, when the instance is
        // already destroyed and its events can no longer be handled safely
        let destroyed = false;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: "#96999D", // matches --muted-foreground
            progressColor: "#4A8A9A", // matches --chart-1 (teal-cyan)
            cursorColor: "#4A8A9A",
            cursorWidth: 2,
            barWidth: 2,
            barGap: 2,
            barRadius: 2,
            barMinHeight: 4,
            height: "auto",
            normalize: true,
        });

        wavesurferRef.current = ws;

        ws.on("ready", () => {
            setIsReady(true);
            setDuration(ws.getDuration());

            // Catch NotAllowedError when browser blocks autoplay without user interaction
            if (autoplay) ws.play().catch(() => { });
            onReady?.();
        });

        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));
        ws.on("finish", () => setIsPlaying(false));
        ws.on("timeupdate", (time) => setCurrentTime(time));

        ws.on("error", (error) => {
            if (destroyed) return;
            console.error("WaveSurfer error:", error);
            onError?.(new Error(String(error)));
        });

        ws.load(url).catch((error) => {
            if (destroyed) return;
            console.error("WaveSurfer load error:", error);
            onError?.(new Error(String(error)));
        });

        // Cleanup on unmount or dependency change: destroy the instance and
        // mark it destroyed so late events/errors are ignored
        return () => {
            destroyed = true;
            ws.destroy();
        };
    }, [url, autoplay, onReady, onError, isMobile]);

    // Controls are stable callbacks operating on the ref, so they never need
    // to be recreated when state changes
    const togglePlayPause = useCallback(() => {
        wavesurferRef.current?.playPause();
    }, []);

    // WaveSurfer seeks by a 0-1 ratio, so convert target seconds accordingly
    const seekForward = useCallback((seconds = 5) => {
        const ws = wavesurferRef.current;
        if (!ws) return;

        const newTime = Math.min(ws.getCurrentTime() + seconds, ws.getDuration());
        ws.seekTo(newTime / ws.getDuration());
    }, []);

    const seekBackward = useCallback((seconds = 5) => {
        const ws = wavesurferRef.current;
        if (!ws) return;

        const newTime = Math.max(ws.getCurrentTime() - seconds, 0);
        ws.seekTo(newTime / ws.getDuration());
    }, []);

    return {
        containerRef,
        isPlaying,
        isReady,
        currentTime,
        duration,
        togglePlayPause,
        seekForward,
        seekBackward,
    };
};