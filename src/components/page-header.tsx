/**
 * -----------------------------------------------------------------------------
 * Page header
 * -----------------------------------------------------------------------------
 * A compact top bar for pages that don't render the full dashboard header —
 * primarily used on mobile/tablet layouts (hidden on `lg` where the sidebar
 * and `DashboardHeader` take over). Shows a sidebar toggle, the page title,
 * and feedback/support mailto buttons. Consumed by `DashboardView` and any
 * route needing a lightweight title bar.
 */
import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/**
 * Renders a bordered top bar with the page title and support actions.
 *
 * @param title - The page title displayed next to the sidebar trigger.
 * @param className - Optional classes merged onto the root container
 * (commonly used to hide the header on desktop via `lg:hidden`).
 */
export function PageHeader({
    title,
    className,
}: {
    title: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between border-b px-4 py-4",
                className,
            )}
        >
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
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
}