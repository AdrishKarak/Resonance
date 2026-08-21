"use client";

/**
 * -----------------------------------------------------------------------------
 * Voice avatar
 * -----------------------------------------------------------------------------
 * A small circular avatar representing a voice. Instead of storing images,
 * avatars are generated deterministically from a `seed` (the voice's identity)
 * via DiceBear, so every voice gets a stable, unique look with zero storage
 * cost. Falls back to the first two letters of the voice name while the SVG
 * data URI loads. Used in voice lists/cards across the voices and
 * text-to-speech features.
 */
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useVoiceAvatar } from "./use-voice-avatar";

/** Props for {@link VoiceAvatar}. */
interface VoiceAvatarProps {
    /** Deterministic seed for the generated avatar (e.g. the voice ID). */
    seed: string;
    /** Display name; used for alt text and the initials fallback. */
    name: string;
    className?: string;
};

/**
 * Renders a deterministic DiceBear avatar for a voice.
 *
 * @param seed - Seed passed to the avatar generator for a stable image.
 * @param name - Voice display name for alt text / initials fallback.
 * @param className - Optional classes to override size/border defaults.
 */
export function VoiceAvatar({
    seed,
    name,
    className
}: VoiceAvatarProps) {
    const avatarUrl = useVoiceAvatar(seed);

    return (
        <Avatar
            className={cn("size-4 border-white shadow-xs", className)}
        >
            {/* Data URI generated locally from the seed — no network fetch. */}
            <AvatarImage src={avatarUrl} alt={name} />
            {/* Initials shown only if the image fails to render. */}
            <AvatarFallback className="text-[8px]">
                {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
};