"use client";

/**
 * -----------------------------------------------------------------------------
 * Audio playback hook
 * -----------------------------------------------------------------------------
 * Minimal play/pause controller for a single audio source, which can be
 * either a URL string (e.g. an R2-hosted TTS result) or a `File` (e.g. a
 * locally recorded/uploaded voice sample). It lazily creates the underlying
 * `HTMLAudioElement` on first play, exposes `isPlaying`/`isLoading` state for
 * UI, and tears the element down whenever the source changes to avoid leaking
 * object URLs or playing stale audio. Used by voice preview and playback
 * controls across the voices and text-to-speech features.
 */
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Controls playback of a single audio source.
 *
 * @param src - The audio to play: a URL string or a local `File`. Passing
 * `null` disables playback.
 * @returns An object with:
 * - `isPlaying`: whether audio is currently playing.
 * - `isLoading`: true between pressing play and playback actually starting.
 * - `togglePlay(): void`: plays/pauses the current source.
 */
export function useAudioPlayback(src: string | File | null) {
    // Lazily created on first play; kept in a ref so re-renders don't
    // recreate the element and restart playback from the beginning.
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Cleanup when the source changes or the component unmounts: pause,
    // drop the src (also releases any blob URL reference), and reset so the
    // next toggle builds a fresh Audio element for the new source.
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeAttribute("src");
                audioRef.current = null;
            }
        };
    }, [src]);

    const togglePlay = useCallback(() => {
        if (!src) return;

        // Build the Audio element on first use. Files need an object URL
        // since they have no addressable src yet.
        if (!audioRef.current) {
            const url = src instanceof File ? URL.createObjectURL(src) : src;
            audioRef.current = new Audio(url);
            audioRef.current.addEventListener("ended", () => setIsPlaying(false));
            // `once` so the loading flag clears only for the initial buffer.
            audioRef.current.addEventListener(
                "canplaythrough",
                () => setIsLoading(false),
                { once: true },
            );
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsLoading(true);
            audioRef.current.play().then(() => {
                setIsPlaying(true);
                setIsLoading(false);
            });
        }
    }, [src, isPlaying]);

    return { isPlaying, isLoading, togglePlay };
};