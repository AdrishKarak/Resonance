/**
 * Config for a single generation-tuning slider rendered by
 * SettingsPanelSettings.
 */
interface Slider {
    /** Form field this slider binds to (must match TTSFormValues keys). */
    id: "temperature" | "topP" | "topK" | "repetitionPenalty";
    /** Human-friendly display label above the slider. */
    label: string;
    /** Label shown at the low end of the range. */
    leftLabel: string;
    /** Label shown at the high end of the range. */
    rightLabel: string;
    /** Minimum selectable value. */
    min: number;
    /** Maximum selectable value. */
    max: number;
    /** Increment between selectable values. */
    step: number;
    /** Initial value; mirrors the matching default in defaultTTSValues. */
    defaultValue: number;
};

/**
 * Declarative slider configuration driving the settings UI. Each entry maps
 * 1:1 to a numeric field in the shared TTS form (temperature, topP, topK,
 * repetitionPenalty), so new tuning parameters only require an entry here plus
 * a schema/default update in text-to-speech-form.tsx.
 */
export const sliders: Slider[] = [
    {
        id: "temperature",
        label: "Creativity",
        leftLabel: "Consistent",
        rightLabel: "Expressive",
        min: 0,
        max: 2,
        step: 0.1,
        defaultValue: 0.8,
    },
    {
        id: "topP",
        label: "Voice Variety",
        leftLabel: "Stable",
        rightLabel: "Dynamic",
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 0.95,
    },
    {
        id: "topK",
        label: "Expression Range",
        leftLabel: "Subtle",
        rightLabel: "Dramatic",
        min: 1,
        max: 10000,
        step: 100,
        defaultValue: 1000,
    },
    {
        id: "repetitionPenalty",
        label: "Natural Flow",
        leftLabel: "Rhythmic",
        rightLabel: "Varied",
        min: 1,
        max: 2,
        step: 0.1,
        defaultValue: 1.2,
    },
];