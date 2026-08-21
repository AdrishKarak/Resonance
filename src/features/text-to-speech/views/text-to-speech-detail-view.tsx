"use client";

/**
 * -----------------------------------------------------------------------------
 * Text-to-speech detail view
 * -----------------------------------------------------------------------------
 * The workspace shown at /text-to-speech/[generationId] for a previously
 * generated audio item. It loads the generation record (`generations.getById`)
 * and available voices (`voices.getAll`) in parallel via suspense, then seeds
 * the shared form with the generation's saved parameters. Unlike the main view,
 * it renders the actual audio playback panels (VoicePreviewPanel on desktop,
 * VoicePreviewMobile on mobile) instead of the empty-state placeholder.
 */
import { useSuspenseQueries } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { TextInputPanel } from "@/features/text-to-speech/components/text-input-panel";
import { SettingsPanel } from "@/features/text-to-speech/components/settings-panel";
import {
    TextToSpeechForm,
    type TTSFormValues
} from "@/features/text-to-speech/components/text-to-speech-form";
import { TTSVoicesProvider } from "../contexts/tts-voices-context";
import { VoicePreviewPanel } from "../components/voice-preview-panel";
import { VoicePreviewMobile } from "../components/voice-preview-mobile";

/**
 * Renders the TTS workspace pre-filled with an existing generation's data.
 *
 * @param props.generationId - ID of the generation to load and display.
 * @returns The voices provider, form provider, and detail workspace layout.
 */
export function TextToSpeechDetailView({
    generationId,
}: {
    /**
     * The ID of the generation record to fetch and display.
     */
    generationId: string;
}) {
    const trpc = useTRPC();
    // Fetch the generation and voice list in parallel; both are required to render
    const [
        generationQuery,
        voicesQuery,
    ] = useSuspenseQueries({
        queries: [
            trpc.generations.getById.queryOptions({ id: generationId }),
            trpc.voices.getAll.queryOptions()
        ],
    });

    const data = generationQuery.data;
    const { custom: customVoices, system: systemVoices } = voicesQuery.data;
    const allVoices = [...customVoices, ...systemVoices];

    const fallbackVoiceId = allVoices[0]?.id ?? "";

    // Requested voice may no longer exist (deleted); fall back to first available
    const resolvedVoiceId =
        data?.voiceId &&
            allVoices.some((v) => v.id === data.voiceId)
            ? data.voiceId
            : fallbackVoiceId;

    // Seed the form with the exact parameters used when this audio was generated
    const defaultValues: TTSFormValues = {
        text: data.text,
        voiceId: resolvedVoiceId,
        temperature: data.temperature,
        topP: data.topP,
        topK: data.topK,
        repetitionPenalty: data.repetitionPenalty,
    };

    // Use the denormalized voiceName snapshot instead of a populated voice relation
    // so the preview always shows the voice name at the time of generation,
    // even if the voice was later renamed or deleted.
    const generationVoice = {
        id: data.voiceId ?? undefined,
        name: data.voiceName,
    };

    return (
        <TTSVoicesProvider value={{ customVoices, systemVoices, allVoices }}>
            {/* key remounts the form when navigating between generations */}
            <TextToSpeechForm key={generationId} defaultValues={defaultValues}>
                <div className="flex min-h-0 flex-1 overflow-hidden">
                    <div className="flex min-h-0 flex-1 flex-col">
                        <TextInputPanel />
                        <VoicePreviewMobile
                            audioUrl={data.audioUrl}
                            voice={generationVoice}
                            text={data.text}
                        />
                        <VoicePreviewPanel
                            audioUrl={data.audioUrl}
                            voice={generationVoice}
                            text={data.text}
                        />
                    </div>
                    <SettingsPanel />
                </div>
            </TextToSpeechForm>
        </TTSVoicesProvider>
    );
};