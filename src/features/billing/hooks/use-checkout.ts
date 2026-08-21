/**
 * -----------------------------------------------------------------------------
 * Polar checkout hook
 * -----------------------------------------------------------------------------
 * Wraps the `billing.createCheckout` tRPC mutation behind a simple imperative
 * `checkout()` callback. The server creates a Polar checkout session and
 * returns its hosted URL; because Polar checkout is a full-page flow (not an
 * iframe/modal), we navigate the current tab to it via `window.location`.
 * Used by any UI that lets users start a subscription, e.g. `UpgradeCard`
 * inside the billing usage container.
 */
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

/**
 * Initiates a Polar hosted-checkout session for the active organization.
 *
 * @returns An object with:
 * - `checkout`: call to create the session and redirect the browser to it.
 * - `isPending`: true while the checkout session is being created.
 */
export function useCheckout() {
    const trpc = useTRPC();
    const mutation = useMutation(
        trpc.billing.createCheckout.mutationOptions({})
    );

    const checkout = useCallback(() => {
        mutation.mutate(undefined, {
            // Full-page redirect to Polar's hosted checkout; the user returns
            // to the app after completing (or abandoning) payment there.
            onSuccess: (data) => {
                window.location.href = data.checkoutUrl;
            },
        });
    }, [mutation]);

    return { checkout, isPending: mutation.isPending };
};