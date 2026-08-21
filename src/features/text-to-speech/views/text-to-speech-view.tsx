"use client";

/**
 * -----------------------------------------------------------------------------
 * Text-to-speech main view
 * -----------------------------------------------------------------------------
 * The primary TTS workspace shown at /text-to-speech. It fetches the user's
 * available voices via the `voices.getAll` tRPC procedure, resolves a safe
 * initial voice selection, and wires up the shared form state (TextToSpeechForm)
 * plus the voices context (TTSVoicesProvider) consumed by all child panels:
 * TextInputPanel, VoicePreviewPlaceholder, and SettingsPanel.
 */
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { TextInputPanel } from "@/features/text-to-speech/components/text-input-panel";
import { VoicePreviewPlaceholder } from "@/features/text-to-speech/components/voice-preview-placeholder";
import { SettingsPanel } from "@/features/text-to-speech/components/settings-panel";
import {
    TextToSpeechForm,
    defaultTTSValues,
    type TTSFormValues
} from "@/features/text-to-speech/components/text-to-speech-form";
import { TTSVoicesProvider } from "../contexts/tts-voices-context";

/**
 * Renders the full TTS workspace for creating new generations.
 *
 * @param props.initialValues - Optional pre-filled form values (e.g. voiceId)
 * used to seed the generation form.
 * @returns The voices provider, form provider, and workspace layout.
 */
export function TextToSpeechView({
    initialValues,
}: {
    /**
     * Optional partial form values to pre-populate the form with.
     */
    initialValues?: Partial<TTSFormValues>;
}) {
    const trpc = useTRPC();
    const {
        data: voices,
    } = useSuspenseQuery(trpc.voices.getAll.queryOptions());

    const { custom: customVoices, system: systemVoices } = voices;

    // Combine team (custom) and built-in (system) voices into one selectable pool
    const allVoices = [...customVoices, ...systemVoices];
    const fallbackVoiceId = allVoices[0]?.id ?? "";

    // Requested voice may no longer exist (deleted); fall back to first available
    const resolvedVoiceId =
        initialValues?.voiceId &&
            allVoices.some((v) => v.id === initialValues.voiceId)
            ? initialValues.voiceId
            : fallbackVoiceId;

    // Merge caller-provided values over the defaults so every form field is defined
    const defaultValues: TTSFormValues = {
        ...defaultTTSValues,
        ...initialValues,
        voiceId: resolvedVoiceId,
    };

    return (
        <TTSVoicesProvider value={{ customVoices, systemVoices, allVoices }}>
            <TextToSpeechForm defaultValues={defaultValues}>
                <div className="flex min-h-0 flex-1 overflow-hidden">
                    <div className="flex min-h-0 flex-1 flex-col">
                        <TextInputPanel />
                        <VoicePreviewPlaceholder />
                    </div>
                    <SettingsPanel />
                </div>
            </TextToSpeechForm>
        </TTSVoicesProvider>
    );
};