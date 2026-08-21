/**
 * -----------------------------------------------------------------------------
 * Voice avatar generator hook
 * -----------------------------------------------------------------------------
 * Deterministically generates an avatar image for a voice using DiceBear's
 * "glass" style. The same seed always produces the same image, so voices get
 * a stable visual identity without storing any image assets — the result is
 * an inline SVG data URI, meaning zero network requests. Memoized on `seed`
 * so re-renders don't regenerate the URI. Consumed by the `VoiceAvatar`
 * component.
 */
import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { glass } from "@dicebear/collection";

/**
 * Generates a deterministic avatar data URI for the given seed.
 *
 * @param seed - Any stable string (typically the voice ID); identical seeds
 * yield identical avatars.
 * @returns An SVG data URI suitable for use as an `<img src>`.
 */
export function useVoiceAvatar(seed: string) {
    return useMemo(() => {
        return createAvatar(glass, {
            seed,
            size: 128,
        }).toDataUri();
    }, [seed]);
};