/**
 * -----------------------------------------------------------------------------
 * Quick actions panel
 * -----------------------------------------------------------------------------
 * Renders the "Quick actions" section of the dashboard: a responsive grid of
 * {@link QuickActionCard}s built from the static `quickActions` dataset. Each
 * card deep-links into the text-to-speech page pre-filled with a sample
 * prompt, giving new users one-click demos of the product. Consumed by
 * `DashboardView`.
 */
import { quickActions } from "@/features/dashboard/data/quick-actions";
import { QuickActionCard } from "./quick-action-card";


/**
 * Renders the quick actions heading and card grid.
 *
 * @returns A section containing a title and a responsive grid of
 * {@link QuickActionCard} components.
 */
export function QuickActionsPanel() {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {quickActions.map((action) => (
                    <QuickActionCard
                        key={action.title}
                        title={action.title}
                        description={action.description}
                        gradient={action.gradient}
                        href={action.href}
                    />
                ))}
            </div>
        </div>
    );
};