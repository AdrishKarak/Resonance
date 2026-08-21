/**
 * -----------------------------------------------------------------------------
 * Text-to-speech layout
 * -----------------------------------------------------------------------------
 * Shared layout shell for every route in the /text-to-speech segment. It renders
 * the page header and constrains children to a full-height, non-scrolling column
 * so the workspace (text input + preview + settings panel) can manage its own
 * internal scrolling. Used as the App Router `layout.tsx` wrapper around
 * TextToSpeechView and TextToSpeechDetailView.
 */
import { PageHeader } from "@/components/page-header";

/**
 * Renders the TTS page chrome (header) above the active route content.
 *
 * @param props.children - The active route's page content (a TTS view).
 * @returns The full-height layout shell containing the header and children.
 */
export function TextToSpeechLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <PageHeader title="Text to speech" />
            {children}
        </div>
    );
};