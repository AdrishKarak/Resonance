/**
 * -----------------------------------------------------------------------------
 * Dashboard Layout
 * -----------------------------------------------------------------------------
 * Shared shell for all authenticated app pages in the `(dashboard)` route
 * group (`/`, `/text-to-speech`, `/voices`). It exists to render the
 * collapsible `DashboardSidebar` next to the page content inside shadcn/ui's
 * sidebar primitives, giving every dashboard route a consistent navigation
 * frame without affecting URLs (route groups are stripped from paths).
 * Authentication itself is enforced by Clerk middleware upstream; this layout
 * only handles presentation.
 */
import { cookies } from "next/headers";

import {
    SidebarInset,
    SidebarProvider
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";


/**
 * DashboardLayout reads the persisted sidebar open/closed state from cookies
 * and renders the sidebar alongside the routed page content. Reading the
 * cookie on the server avoids a flash of the sidebar opening/closing on load;
 * the SidebarProvider keeps the cookie in sync whenever the user toggles it.
 *
 * @param children - The active dashboard page (dashboard home, TTS, or voices).
 * @returns The two-pane dashboard shell: fixed sidebar plus main content area.
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Cookies are async in Next.js 15+/16 — await the store, then default the
    // sidebar to collapsed when the cookie is absent or not "true".
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    return (
        <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
            <DashboardSidebar />
            <SidebarInset className="min-h-0 min-w-0">
                <main className="flex min-h-0 flex-1 flex-col">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
};