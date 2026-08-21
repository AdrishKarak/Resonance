/**
 * -----------------------------------------------------------------------------
 * Voices Section Layout
 * -----------------------------------------------------------------------------
 * Shared layout for the `/voices` section. It exists to wrap all voice-related
 * routes in the `VoicesLayout` feature component, giving the voices library a
 * consistent structural frame (e.g. header/panel chrome) shared by any pages
 * added under this segment, without duplicating markup per page.
 */
import { VoicesLayout } from "@/features/voices/views/VoicesLayout";


/**
 * Layout wraps the active voices page in the shared section chrome.
 *
 * @param children - The matched voices route content.
 * @returns The children rendered inside VoicesLayout.
 */
export default function Layout({
    children
}: {
    children: React.ReactNode
}) {
    return <VoicesLayout>{children}</VoicesLayout>;
};