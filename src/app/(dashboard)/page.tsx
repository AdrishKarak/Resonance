/**
 * -----------------------------------------------------------------------------
 * Dashboard Home Page
 * -----------------------------------------------------------------------------
 * The authenticated landing view at `/` (inside the `(dashboard)` route group,
 * which is why the URL has no extra segment). It exists as the post-login /
 * post-org-selection destination: after users sign in and pick an organization
 * via `/org-selection`, Clerk redirects them here. It is a thin wrapper that
 * delegates all rendering and data fetching to the `DashboardView` feature
 * component, keeping route files free of business logic.
 */
import { DashboardView } from "@/features/dashboard/views/dashboard-view";


/**
 * DashboardPage renders the dashboard home view.
 *
 * @returns The dashboard overview content provided by DashboardView.
 */
export default function DashboardPage() {
    return (
        <div>
            <DashboardView />
        </div>
    );
}