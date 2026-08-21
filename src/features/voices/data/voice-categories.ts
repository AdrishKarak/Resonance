/**
 * -----------------------------------------------------------------------------
 * Voice category constants
 * -----------------------------------------------------------------------------
 * Single source of truth for the voice taxonomy shown across the app. The keys
 * mirror the Prisma `VoiceCategory` enum exactly, so this map stays in sync
 * with the database schema. It is consumed by the voice creation form's
 * category select, the API route's zod validation (`/api/voices/create`
 * builds its enum from `VOICE_CATEGORIES`), and display labels on voice cards.
 */
import type { VoiceCategory } from "@/generated/prisma/client";

/**
 * Human-readable label for every Prisma `VoiceCategory` enum value.
 * Typed as a full Record so adding/removing an enum value in Prisma forces a
 * compile-time update here, keeping UI labels exhaustive.
 */
export const VOICE_CATEGORY_LABELS: Record<VoiceCategory, string> = {
    AUDIOBOOK: "Audiobook",
    CONVERSATIONAL: "Conversational",
    CUSTOMER_SERVICE: "Customer Service",
    GENERAL: "General",
    NARRATIVE: "Narrative",
    CHARACTERS: "Characters",
    MEDITATION: "Meditation",
    MOTIVATIONAL: "Motivational",
    PODCAST: "Podcast",
    ADVERTISING: "Advertising",
    VOICEOVER: "Voiceover",
    CORPORATE: "Corporate",
};

/**
 * Array of all `VoiceCategory` enum values, derived from the label map's keys
 * (cast back to the enum type). Used to render the category select options in
 * voice-create-form.tsx and to validate categories server-side.
 */
export const VOICE_CATEGORIES = Object.keys(
    VOICE_CATEGORY_LABELS,
) as VoiceCategory[];