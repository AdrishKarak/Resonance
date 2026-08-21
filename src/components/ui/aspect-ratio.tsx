/**
 * shadcn/ui AspectRatio primitive.
 * Vendored UI building block used across app features via the "@/components/ui/*" alias.
 * Source: https://ui.shadcn.com/docs/components/aspect-ratio
 */
"use client"

import { AspectRatio as AspectRatioPrimitive } from "radix-ui"

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
