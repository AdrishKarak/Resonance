"use client";

/**
 * -----------------------------------------------------------------------------
 * Voice selector button
 * -----------------------------------------------------------------------------
 * Compact trigger showing the currently selected voice (avatar + name). It
 * reads the form's `voiceId` from the shared TTS form and the voice list from
 * TTSVoicesContext, and renders as a DrawerTrigger so it can open either the
 * mobile SettingsDrawer (via TextInputPanel) or another voice-listing drawer.
 */
import { ChevronDown } from "lucide-react";
import { useStore } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { DrawerTrigger } from "@/components/ui/drawer";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { useTTSVoices } from "../contexts/tts-voices-context";
import { ttsFormOptions } from "./text-to-speech-form";

/**
 * Renders the current-voice button that acts as a drawer trigger.
 *
 * @returns The voice selector trigger button element.
 */
export function VoiceSelectorButton() {
    const { allVoices } = useTTSVoices();

    // Reattach to the shared TTS form to read the live voiceId selection
    const form = useTypedAppFormContext(ttsFormOptions);
    const voiceId = useStore(form.store, (s) => s.values.voiceId)

    // Fall back to the first voice when the stored id no longer matches
    const currentVoice =
        allVoices.find((v) => v.id === voiceId) ?? allVoices[0];

    const buttonLabel = currentVoice?.name ?? "Select voice";

    return (
        <DrawerTrigger asChild>
            <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-start gap-2 px-2"
            >
                {currentVoice && (
                    <VoiceAvatar
                        seed={currentVoice.id}
                        name={currentVoice.name}
                        className="size-6"
                    />
                )}
                <span className="flex-1 truncate text-left text-sm font-medium">
                    {buttonLabel}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </Button>
        </DrawerTrigger>
    );
}
