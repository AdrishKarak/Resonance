/**
 * shadcn/ui Spinner primitive.
 * Vendored UI building block used across app features via the "@/components/ui/*" alias.
 * Source: https://ui.shadcn.com/docs/components/spinner
 */
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
