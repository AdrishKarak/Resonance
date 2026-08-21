"use client";

/**
 * -----------------------------------------------------------------------------
 * Voice selector
 * -----------------------------------------------------------------------------
 * The "Voice style" select field inside SettingsPanelSettings. It reads the
 * voice pool from TTSVoicesContext (split into team/custom and built-in/system
 * groups) and writes the chosen id back to the shared TTS form's `voiceId`
 * field, keeping the selection in sync with VoiceSelectorButton and the
 * generate flow.
 */
import { useStore } from "@tanstack/react-form";

import {
    VOICE_CATEGORY_LABELS
} from "@/features/voices/data/voice-categories";

import { Field, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";

import { useTTSVoices } from "../contexts/tts-voices-context";
import { ttsFormOptions } from "./text-to-speech-form";

/**
 * Renders the grouped voice selection dropdown bound to the shared form.
 *
 * @returns The voice selector field element.
 */
export function VoiceSelector() {
    const {
        customVoices,
        systemVoices,
        allVoices: voices
    } = useTTSVoices();

    // Reattach to the shared TTS form for the current selection and busy state
    const form = useTypedAppFormContext(ttsFormOptions);
    const voiceId = useStore(form.store, (s) => s.values.voiceId);
    const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

    // Exclude voices with blank ids so they can't be picked as valid options
    const selectableCustomVoices = customVoices.filter((v) => v.id.trim().length > 0);
    const selectableSystemVoices = systemVoices.filter((v) => v.id.trim().length > 0);
    const selectableVoices = voices.filter((v) => v.id.trim().length > 0);

    // The stored voiceId may reference a deleted/unavailable voice; keep it
    // visible as a disabled-style entry instead of silently switching selection
    const selectedVoice = selectableVoices.find((v) => v.id === voiceId);
    const hasMissingSelectedVoice = Boolean(voiceId) && !selectedVoice;
    const currentVoice = selectedVoice
        ? selectedVoice
        : hasMissingSelectedVoice
            ? {
                id: voiceId,
                name: "Unavailable voice",
                category: null as null,
            }
            : voices[0];

    return (
        <Field>
            <FieldLabel>Voice style</FieldLabel>
            <Select
                value={voiceId || undefined}
                // Write the selection straight into the shared form's voiceId
                onValueChange={(v) => form.setFieldValue("voiceId", v)}
                disabled={isSubmitting}
            >
                <SelectTrigger className="w-full h-auto gap-1 rounded-lg bg-white px-2 py-1">
                    <SelectValue placeholder="Select a voice">
                        {currentVoice && (
                            <>
                                <VoiceAvatar
                                    seed={currentVoice.id}
                                    name={currentVoice.name}
                                />
                                <span className="truncate text-sm font-medium tracking-tight">
                                    {currentVoice.name}
                                    {currentVoice.category &&
                                        ` - ${VOICE_CATEGORY_LABELS[currentVoice.category]}`
                                    }
                                </span>
                            </>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {/* Pinned entry for a currently selected but unavailable voice */}
                    {hasMissingSelectedVoice && currentVoice && currentVoice.id.trim().length > 0 && (
                        <>
                            <SelectGroup>
                                <SelectLabel>Selected Voice</SelectLabel>
                                <SelectItem value={currentVoice.id}>
                                    <VoiceAvatar
                                        seed={currentVoice.id}
                                        name={currentVoice.name}
                                    />
                                    <span className="truncate text-sm font-medium">
                                        {currentVoice.name}
                                        {currentVoice.category &&
                                            ` - ${VOICE_CATEGORY_LABELS[currentVoice.category]}`}
                                    </span>
                                </SelectItem>
                            </SelectGroup>
                            {(selectableCustomVoices.length > 0 || selectableSystemVoices.length > 0) && (
                                <SelectSeparator />
                            )}
                        </>
                    )}
                    {selectableCustomVoices.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Team Voices</SelectLabel>
                            {selectableCustomVoices.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                    <VoiceAvatar seed={v.id} name={v.name} />
                                    <span className="truncate text-sm font-medium">
                                        {v.name} - {VOICE_CATEGORY_LABELS[v.category]}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                    {selectableCustomVoices.length > 0 && selectableSystemVoices.length > 0 && (
                        <SelectSeparator />
                    )}
                    {selectableSystemVoices.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Built-in Voices</SelectLabel>
                            {selectableSystemVoices.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                    <VoiceAvatar seed={v.id} name={v.name} />
                                    <span className="truncate text-sm font-medium">
                                        {v.name} - {VOICE_CATEGORY_LABELS[v.category]}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                </SelectContent>
            </Select>
        </Field>
    );
};
