import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { QuickAction } from "@/features/dashboard/data/quick-actions";
import { cn } from "@/lib/utils";

/** Props mirror the `QuickAction` data shape one-to-one. */
type QuickActionCardProps = QuickAction;

/**
 * A single dashboard shortcut card: gradient thumbnail, title/description,
 * and a "Try now" link that deep-links into the TTS page with a pre-filled
 * sample prompt.
 *
 * @param title - Card heading, also used as the React key by the parent grid.
 * @param description - Short marketing copy explaining the use case.
 * @param gradient - Tailwind `from-*`/`to-*` classes applied to the thumbnail.
 * @param href - Destination URL (typically `/text-to-speech?text=...`).
 */
export function QuickActionCard({
    title,
    description,
    gradient,
    href,
}: QuickActionCardProps) {
    return (
        <div className="group flex gap-4 rounded-xl border bg-card p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            {/* Visual placeholder with gradient */}
            <div
                className={cn(
                    "relative h-31 w-41 shrink-0 overflow-hidden rounded-xl bg-linear-to-br transition-transform duration-500 group-hover:scale-[1.02]",
                    gradient,
                )}
            >
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-12 rounded-full bg-white/30 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="absolute inset-2 rounded-lg ring-2 ring-inset ring-white/20 transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between py-1">
                <div className="space-y-1">
                    <h3 className="text-sm font-medium transition-colors group-hover:text-primary">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="xs"
                    className="w-fit transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                    asChild
                >
                    <Link href={href}>
                        Try now
                        <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>
        </div>
    )
};