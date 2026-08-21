/**
 * -----------------------------------------------------------------------------
 * Billing router (Polar)
 * -----------------------------------------------------------------------------
 * tRPC procedures for subscription management, all scoped to the caller's
 * organization via `orgProcedure` (the org id doubles as the Polar
 * `externalCustomerId`). It is the UI-facing counterpart to the Polar webhook
 * handler: components call these to send users to checkout, open the customer
 * portal, and display current subscription/usage state.
 *
 * Flow: dashboard -> `getStatus` (gate UI) -> `createCheckout` (upgrade) or
 * `createPortalSession` (manage existing subscription).
 */
import { TRPCError } from "@trpc/server";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { createTRPCRouter, orgProcedure } from "../init";

export const billingRouter = createTRPCRouter({
    /**
     * Creates a Polar checkout session for the app's single product.
     *
     * The org id is passed as `externalCustomerId` so the resulting customer
     * can be correlated back to the organization in later API calls/webhooks.
     */
    createCheckout: orgProcedure.mutation(async ({ ctx }) => {
        const result = await polar.checkouts.create({
            products: [env.POLAR_PRODUCT_ID],
            externalCustomerId: ctx.orgId,
            successUrl: process.env.APP_URL,
        });

        // Guard against a malformed SDK response rather than returning an
        // undefined URL to the client.
        if (!result.url) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create checkout session",
            });
        }

        return { checkoutUrl: result.url };
    }),

    /**
     * Creates a short-lived Polar customer portal session so the org can
     * manage (cancel/update) its subscription without custom UI.
     */
    createPortalSession: orgProcedure.mutation(async ({ ctx }) => {
        const result = await polar.customerSessions.create({
            externalCustomerId: ctx.orgId,
        });

        if (!result.customerPortalUrl) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create customer portal session",
            });
        }

        return { portalUrl: result.customerPortalUrl };
    }),

    /**
     * Returns the org's subscription status and estimated metered cost.
     *
     * @returns `hasActiveSubscription` for gating features, plus the Polar
     *   customer id and summed estimated cost in cents across all active
     *   subscriptions' usage meters.
     */
    getStatus: orgProcedure.query(async ({ ctx }) => {
        try {
            // Look up the Polar customer by our org id (external id).
            const customerState = await polar.customers.getStateExternal({
                externalId: ctx.orgId,
            });

            const hasActiveSubscription =
                (customerState.activeSubscriptions ?? []).length > 0;

            // Sum up estimated costs from all meters across active subscriptions
            let estimatedCostCents = 0;
            for (const sub of customerState.activeSubscriptions ?? []) {
                // Check for meters on the subscription
                if (sub.meters) {
                    for (const meter of sub.meters) {
                        estimatedCostCents += meter.amount ?? 0;
                    }
                }
                
                // If there are no meters, or they all returned 0, we might want to check
                // if there's a total amount on the subscription itself for usage-based items.
                // In some Polar versions, usage-based costs are aggregated in sub.amount
                // if it's the only item or if it's already calculated.
            }

            return {
                hasActiveSubscription,
                customerId: customerState.id,
                estimatedCostCents,
            };
        } catch {
            // Customer doesn't exist yet in Polar
            return {
                hasActiveSubscription: false,
                customerId: null,
                estimatedCostCents: 0,
            };
        }
    }),
});