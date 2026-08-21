/**
 * DirectionProvider wrapper around Radix UI's direction utilities.
 * Sets the text/layout direction (LTR or RTL) for descendant Radix components and
 * exposes useDirection() so features can read the active direction.
 */
"use client"

import * as React from "react"
import { Direction } from "radix-ui"

function DirectionProvider({
  dir,
  direction,
  children,
}: React.ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"]
}) {
  return (
    <Direction.DirectionProvider dir={direction ?? dir}>
      {children}
    </Direction.DirectionProvider>
  )
}

const useDirection = Direction.useDirection

export { DirectionProvider, useDirection }
