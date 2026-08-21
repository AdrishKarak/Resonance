"use client";

/**
 * -----------------------------------------------------------------------------
 * Text-to-speech form
 * -----------------------------------------------------------------------------
 * Owns the shared TanStack Form instance for the entire TTS workspace: the text
 * payload, selected voice, and the generation tuning parameters. It defines the
 * zod schema, default values, and the `ttsFormOptions` used by child panels
 * (TextInputPanel, VoiceSelector, SettingsPanelSettings) to reattach to the same
 * form via useTypedAppFormContext. On submit it calls the `generations.create`
 * tRPC mutation, handles billing/subscription errors, and routes to the new
 * generation's detail page.
 */
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";
import { useCheckout } from "@/features/billing/hooks/use-checkout";

// Validation schema mirroring the input expected by generations.create
const ttsFormSchema = z.object({
    text: z.string().min(1, "Please enter some text"),
    voiceId: z.string().min(1, "Please select a voice"),
    temperature: z.number(),
    topP: z.number(),
    topK: z.number(),
    repetitionPenalty: z.number(),
});

/**
 * Inferred TypeScript type for the TTS form values.
 */
export type TTSFormValues = z.infer<typeof ttsFormSchema>;

/**
 * Default form values; tuning defaults match the slider defaults in
 * data/sliders.ts.
 */
export const defaultTTSValues: TTSFormValues = {
    text: "",
    voiceId: "",
    temperature: 0.8,
    topP: 0.95,
    topK: 1000,
    repetitionPenalty: 1.2,
};

/**
 * Shared form options. Child components pass these to useTypedAppFormContext so
 * every panel reads/writes the same underlying form store.
 */
export const ttsFormOptions = formOptions({
    defaultValues: defaultTTSValues,
});

/**
 * Provides the TTS form context to its children.
 *
 * @param props.children - Workspace panels that consume the form context
 * (rendered inside form.AppForm).
 * @param props.defaultValues - Optional pre-filled values (e.g. from a URL or
 * previous generation) merged over the defaults by the caller.
 * @returns The form provider wrapper element.
 */
export function TextToSpeechForm({
    children,
    defaultValues,
}: {
    children: React.ReactNode;
    defaultValues?: TTSFormValues;
}) {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();
    const createMutation = useMutation(
        trpc.generations.create.mutationOptions({}),
    );

    const { checkout } = useCheckout();

    // Validate with the zod schema on submit and drive the generations.create
    // mutation; errors are surfaced as toasts (with a checkout shortcut when a
    // subscription is required)
    const form = useAppForm({
        ...ttsFormOptions,
        defaultValues: defaultValues ?? defaultTTSValues,
        validators: {
            onSubmit: ttsFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                const data = await createMutation.mutateAsync({
                    text: value.text.trim(),
                    voiceId: value.voiceId,
                    temperature: value.temperature,
                    topP: value.topP,
                    topK: value.topK,
                    repetitionPenalty: value.repetitionPenalty,
                });

                toast.success("Audio generated successfully!");

                // Invalidate billing status to reflect usage
                queryClient.invalidateQueries({
                    queryKey: trpc.billing.getStatus.queryKey(),
                });

                router.push(`/text-to-speech/${data.id}`);
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to generate audio";

                // Sentinel error from the server when the user is out of credits;
                // offer an inline upgrade path via the billing checkout flow
                if (message === "SUBSCRIPTION REQUIRED") {
                    toast.error("Subscription required", {
                        action: {
                            label: "Subscribe",
                            onClick: () => checkout(),
                        },
                    });
                } else {
                    toast.error(message);
                }
            }
        },
    });

    return <form.AppForm>{children}</form.AppForm>;
};