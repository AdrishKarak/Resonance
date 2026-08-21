/**
 * -----------------------------------------------------------------------------
 * VoicesLayout
 * -----------------------------------------------------------------------------
 * Server-safe layout wrapper for the Voices page, used by the App Router
 * route under src/app. It exists to give every voices sub-route a consistent
 * chrome — a sticky page header above a fixed-height content area — without
 * duplicating markup per route.
 *
 * It composes the shared PageHeader component and renders the routed page
 * (typically VoicesView) as its child, constrained to the remaining viewport
 * height so inner lists scroll independently of the header.
 */

import { PageHeader } from "@/components/page-header";

/**
 * Renders the voices page chrome around routed children.
 *
 * @param children - The routed page content rendered below the header.
 * @returns A full-height column with the "Voices" header on top.
 */
export function VoicesLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <PageHeader title="Voices" />
            {children}
        </div>
    );
}