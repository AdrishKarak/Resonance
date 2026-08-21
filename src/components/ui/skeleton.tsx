/**
 * shadcn/ui Skeleton primitive.
 * Vendored UI building block used across app features via the "@/components/ui/*" alias.
 * Source: https://ui.shadcn.com/docs/components/skeleton
 */
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
