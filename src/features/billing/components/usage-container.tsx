/**
 * -----------------------------------------------------------------------------
 * Billing usage container
 * -----------------------------------------------------------------------------
 * A compact widget rendered in the dashboard sidebar footer that surfaces the
 * signed-in organization's billing state. It queries the `billing.getStatus`
 * tRPC procedure (which reads Polar subscription data) and conditionally shows
 * either an upgrade prompt (pay-as-you-go checkout via `useCheckout`) or the
 * current period's estimated spend with a link into the Polar customer portal.
 * It is consumed exclusively by `DashboardSidebar`.
 */
import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCheckout } from "@/features/billing/hooks/use-checkout";
import { useTRPC } from "@/trpc/client";

/**
 * Formats an integer amount of cents as a USD currency string (e.g. 123 -> "$1.23").
 * Costs are stored in cents to avoid floating point issues, so we divide by 100 here.
 */
function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

/**
 * Shown when the organization has no active Polar subscription. Kicks off a
 * hosted Polar checkout via `useCheckout`, which redirects the whole page to
 * the checkout URL, hence the "Redirecting..." pending state.
 */
function UpgradeCard() {
    const { checkout, isPending: isCheckoutPending } = useCheckout();

    return (
        <div className="flex flex-col gap-3">
            <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                    Pay as you go
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Generate speech starting at $0.30 per 1,000 characters
                </p>
            </div>
            <Button
                variant="outline"
                className="w-full text-xs"
                size="sm"
                disabled={isCheckoutPending}
                onClick={checkout}
            >
                {isCheckoutPending ? (
                    <>
                        <Spinner className="size-3" />
                        Redirecting...
                    </>
                ) : (
                    "Upgrade"
                )}
            </Button>
        </div>
    );
};

/**
 * Shown when the organization has an active subscription. Displays the
 * estimated cost (in cents) for the current billing period and opens the
 * Polar customer portal in a new tab so users can manage their subscription.
 */
function UsageCard({
    estimatedCostCents
}: {
    estimatedCostCents: number
}) {
    const trpc = useTRPC();
    const portalMutation = useMutation(
        trpc.billing.createPortalSession.mutationOptions({}),
    );

    // Ask the server to create a Polar customer portal session, then open the
    // returned portal URL in a new tab (server-side auth keeps the URL secret).
    const openPortal = useCallback(() => {
        portalMutation.mutate(undefined, {
            onSuccess: (data) => {
                window.open(data.portalUrl, "_blank");
            },
        });
    }, [portalMutation]);

    return (
        <div className="flex flex-col gap-3">
            <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                    Current usage
                </p>
                <p className="text-xl font-bold tracking-tight text-foreground mt-1">
                    {formatCurrency(estimatedCostCents)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Estimated this period
                </p>
            </div>
            <Button
                variant="outline"
                className="w-full text-xs"
                size="sm"
                disabled={portalMutation.isPending}
                onClick={openPortal}
            >
                {portalMutation.isPending ? (
                    <>
                        <Spinner className="size-3" />
                        Redirecting...
                    </>
                ) : (
                    "Manage Subscription"
                )}
            </Button>
        </div>
    );
};

/**
 * Public entry point for the sidebar billing widget. Fetches billing status
 * via tRPC and renders either {@link UsageCard} (active subscription) or
 * {@link UpgradeCard} (no subscription).
 *
 * @returns A bordered container with the appropriate billing card inside.
 */
export function UsageContainer() {
    const trpc = useTRPC();
    const { data } = useQuery(trpc.billing.getStatus.queryOptions());

    return (
        <div className="group-data-[collapsible=icon]:hidden bg-background border border-border rounded-lg p-3">
            {data?.hasActiveSubscription ? (
                <UsageCard estimatedCostCents={data.estimatedCostCents} />
            ) : (
                <UpgradeCard />
            )}
        </div>
    );
};