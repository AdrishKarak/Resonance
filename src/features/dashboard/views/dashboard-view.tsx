/**
 * -----------------------------------------------------------------------------
 * Dashboard view
 * -----------------------------------------------------------------------------
 * The composition root for the main dashboard page ("/"). It assembles the
 * decorative hero background, the personalized greeting header, the quick
 * text-to-speech input panel, and the grid of quick action shortcuts. Rendered
 * by the dashboard route and relies on shared `PageHeader` plus feature-local
 * dashboard components; it holds no state of its own.
 */
import { PageHeader } from "@/components/page-header";
import { HeroPattern } from "@/features/dashboard/components/hero-pattern";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { TextInputPanel } from "@/features/dashboard/components/text-input-panel";
import { QuickActionsPanel } from "../components/quick-actions-panel";

/**
 * Renders the full dashboard layout.
 *
 * @returns The dashboard page: mobile-only page header, animated wave
 * background, greeting, text input panel, and quick actions grid.
 */
export function DashboardView() {
    return (
        <div className="relative">
            {/* Mobile gets a compact top bar; on desktop the sidebar replaces it. */}
            <PageHeader title="Dashboard" className="lg:hidden" />
            <HeroPattern />
            <div className="relative space-y-8 p-4 lg:p-16">
                <DashboardHeader />
                <TextInputPanel />
                <QuickActionsPanel />
            </div>
        </div>
    );
};