"use client";

/**
 * -----------------------------------------------------------------------------
 * Dashboard greeting header
 * -----------------------------------------------------------------------------
 * The desktop dashboard's top row: a sidebar toggle plus a personalized
 * "Nice to see you, <name>" greeting sourced from the Clerk user profile, and
 * feedback/support mailto buttons on the right. It is rendered by
 * `DashboardView` on the main dashboard page; mobile uses `PageHeader`
 * instead, which is why this component hides itself from small screens via
 * the layout composition rather than its own styles.
 */
import { useUser } from "@clerk/nextjs";
import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Renders the greeting bar with the signed-in user's name and support links.
 *
 * @returns The dashboard header; shows "..." until Clerk user data loads,
 * falling back through fullName -> firstName -> "there".
 */
export function DashboardHeader() {
    const { isLoaded, user } = useUser();

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="hidden lg:block" />
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Nice to see you
                    </p>
                    {/* Cascade name fallbacks since Clerk users may lack a
                        full name; "..." covers the pre-hydration window. */}
                    <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                        {isLoaded ? (user?.fullName ?? user?.firstName ?? "there") : "..."}
                    </h1>
                </div>
            </div>

            {/* Support actions are desktop-only; mobile relies on PageHeader. */}
            <div className="lg:flex items-center gap-3 hidden">
                <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:business@codewithantonio.com">
                        <ThumbsUp />
                        <span className="hidden lg:block">Feedback</span>
                    </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:business@codewithantonio.com">
                        <Headphones />
                        <span className="hidden lg:block">Need help?</span>
                    </Link>
                </Button>
            </div>


        </div>
    );
};