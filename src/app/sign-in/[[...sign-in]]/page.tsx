/**
 * -----------------------------------------------------------------------------
 * Sign-In Page
 * -----------------------------------------------------------------------------
 * Renders Clerk's prebuilt `<SignIn />` multi-step authentication flow at
 * `/sign-in` (and any sub-path such as `/sign-in/factor-one`, handled by the
 * optional catch-all `[[...sign-in]]` segment). It exists as the entry point
 * for returning users; Clerk's middleware and the dashboard layout redirect
 * unauthenticated visitors here, and the landing page's CTA links to it.
 * After a successful sign-in, Clerk returns the user to the protected route
 * they originally requested.
 */
import { SignIn } from "@clerk/nextjs";


/**
 * SignInPage mounts the Clerk SignIn component centered on the screen with
 * themed card styling.
 *
 * @returns The full-screen sign-in page wrapping the Clerk auth card.
 */
export default function SignInPage() {
    return (
        <div className="flex h-screen items-center justify-center">
            <SignIn appearance={{
                elements: {
                    rootBox: "mx-quto",
                    card: "shadow-lg"
                }
            }} />
        </div>
    )
}