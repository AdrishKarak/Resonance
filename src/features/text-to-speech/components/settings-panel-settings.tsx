"use client";

/**
 * -----------------------------------------------------------------------------
 * Settings panel: voice settings
 * -----------------------------------------------------------------------------
 * The "Settings" tab content of the TTS workspace. It binds the shared
 * TanStack Form instance (via ttsFormOptions) to the voice selector and the
 * generation tuning sliders defined in data/sliders.ts. Rendered both inside
 * the desktop SettingsPanel tabs and inside the mobile SettingsDrawer, so it is
 * intentionally layout-agnostic (no own padding container for the page).
 */
import { useStore } from "@tanstack/react-form";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { sliders } from "@/features/text-to-speech/data/sliders";
import { ttsFormOptions } from "@/features/text-to-speech/components/text-to-speech-form";
import { VoiceSelector } from "@/features/text-to-speech/components/voice-selector";

/**
 * Renders the voice selector and one slider per generation parameter
 * (temperature, topP, topK, repetitionPenalty), each bound to its form field.
 *
 * @returns The settings form controls for the TTS workspace.
 */
export function SettingsPanelSettings() {
    // Attach to the shared form instance created by TextToSpeechForm's AppForm
    const form = useTypedAppFormContext(ttsFormOptions);
    const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

    return (
        <>
            {/* Voice Style Dropdown Section */}
            <div className="border-b border-dashed p-4">
                <VoiceSelector />
            </div>

            {/* Voice Adjustments Section */}
            <div className="p-4 flex-1">
                <FieldGroup className="gap-8">
                    {/* Sliders are driven by config so each maps to a named form field */}
                    {sliders.map((slider) => (
                        <form.Field key={slider.id} name={slider.id}>
                            {(field) => (
                                <Field>
                                    <FieldLabel>{slider.label}</FieldLabel>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {slider.leftLabel}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {slider.rightLabel}
                                        </span>
                                    </div>
                                    <Slider
                                        value={[field.state.value]}
                                        onValueChange={(value) => field.handleChange(value[0])}
                                        min={slider.min}
                                        max={slider.max}
                                        step={slider.step}
                                        disabled={isSubmitting}
                                        className="**:data-[slot=slider-thumb]:size-3 **:data-[slot=slider-thumb]:bg-foreground **:data-[slot=slider-track]:h-1"
                                    />
                                </Field>
                            )}
                        </form.Field>
                    ))}
                </FieldGroup>
            </div>
        </>
    );
};