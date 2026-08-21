/**
 * -----------------------------------------------------------------------------
 * Organization Selection Page
 * -----------------------------------------------------------------------------
 * Renders Clerk's `<OrganizationList />` at `/org-selection` so users can pick
 * (or create) the workspace/organization they want to operate in. It exists
 * because the app is multi-tenant: nearly every query and storage object is
 * scoped by `orgId`, so an active organization must be chosen before the
 * dashboard is usable. `hidePersonal` removes the personal-account option,
 * and both post-create and post-select redirects send the user to `/` (the
 * dashboard). Auth middleware routes users here when they have no active org.
 */
import { OrganizationList } from "@clerk/nextjs";

/**
 * OrgSelectionPage mounts the Clerk organization picker centered on screen.
 *
 * @returns The full-screen organization selection page.
 */
export default function OrgSelectionPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <OrganizationList
                hidePersonal
                afterCreateOrganizationUrl="/"
                afterSelectOrganizationUrl="/"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-lg"
                    }
                }} />
        </div>
    )
}
