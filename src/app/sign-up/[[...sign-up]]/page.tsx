/**
 * -----------------------------------------------------------------------------
 * Sign-Up Page
 * -----------------------------------------------------------------------------
 * Renders Clerk's prebuilt `<SignUp />` registration flow at `/sign-up` (and
 * any sub-path such as `/sign-up/verify-email-address`, handled by the optional
 * catch-all `[[...sign-up]]` segment). It exists as the entry point for new
 * users; the landing page's CTA links here, and after account creation Clerk
 * routes the user into the app (where the org-selection flow picks up).
 */
import { SignUp } from "@clerk/nextjs";


/**
 * SignUpPage mounts the Clerk SignUp component centered on the screen with
 * themed card styling.
 *
 * @returns The full-screen sign-up page wrapping the Clerk auth card.
 */
export default function SignUpPage() {
    return (
        <div className="flex h-screen items-center justify-center">
            <SignUp appearance={{
                elements: {
                    rootBox: "mx-quto",
                    card: "shadow-lg"
                }
            }} />
        </div>
    )
}