/**
 * -----------------------------------------------------------------------------
 * Text-to-Speech Section Layout
 * -----------------------------------------------------------------------------
 * Shared layout for the `/text-to-speech` section (the studio page and its
 * per-generation detail pages). It exists to wrap all TTS routes in the
 * `TextToSpeechLayout` feature component, which provides the section's
 * structural chrome (e.g. editor/preview panes) so both the list view and the
 * detail view share identical framing without duplicating markup.
 */
import { TextToSpeechLayout } from "@/features/text-to-speech/views/text-to-speech-layout";

/**
 * Layout wraps the active TTS page in the shared section chrome.
 *
 * @param children - The matched TTS route (studio page or generation detail).
 * @returns The children rendered inside TextToSpeechLayout.
 */
export default function Layout({
    children
}: {
    children: React.ReactNode
}) {
    return <TextToSpeechLayout>{children}</TextToSpeechLayout>;
};