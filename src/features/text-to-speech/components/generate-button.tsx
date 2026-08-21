"use client";

/**
 * -----------------------------------------------------------------------------
 * Generate button
 * -----------------------------------------------------------------------------
 * The primary call-to-action for the TTS workspace. It is a thin, presentational
 * wrapper around Button that shows a spinner + "Generating..." label while the
 * form submission mutation is in flight. It is rendered by TextInputPanel in
 * both the mobile and desktop action bars and simply delegates `onSubmit` back
 * to the shared TanStack Form instance owned by TextToSpeechForm.
 */
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Renders the "Generate speech" submit button with a busy state.
 *
 * @param props.size - Optional Button size variant ("default" or "sm").
 * @param props.disabled - Whether the button is disabled (e.g. invalid form or
 * already submitting).
 * @param props.isSubmitting - When true, swaps the label for a spinner state.
 * @param props.onSubmit - Click handler; typically calls `form.handleSubmit()`.
 * @param props.className - Optional extra classes for layout (e.g. full width
 * on mobile).
 * @returns The generate button element.
 */
export function GenerateButton({
    size,
    disabled,
    isSubmitting,
    onSubmit,
    className,
}: {
    size?: "default" | "sm";
    disabled: boolean;
    isSubmitting: boolean;
    onSubmit: () => void;
    className?: string;
}) {
    return (
        <Button
            size={size}
            className={className}
            onClick={onSubmit}
            disabled={disabled}
        >
            {isSubmitting ? (
                <>
                    <Spinner className="size-3" />
                    Generating...
                </>
            ) : (
                "Generate speech"
            )}
        </Button>
    );
};