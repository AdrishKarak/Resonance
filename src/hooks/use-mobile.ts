/**
 * -----------------------------------------------------------------------------
 * Mobile viewport hook
 * -----------------------------------------------------------------------------
 * Reports whether the current viewport is below the app's `lg` breakpoint
 * (1024px), matching the Tailwind `lg:` classes used to switch between the
 * desktop sidebar and mobile layouts. Uses `matchMedia` so it reacts live to
 * resizes, and resolves asynchronously after mount so SSR output stays
 * consistent (initial state is `undefined` -> falsy). Consumed by layout
 * components such as the sidebar shell.
 */
import * as React from "react"

/** Viewport widths below this are considered "mobile" (matches Tailwind lg). */
const MOBILE_BREAKPOINT = 1024

/**
 * Tracks whether the viewport is narrower than the mobile breakpoint.
 *
 * @returns `true` when the viewport is below 1024px, otherwise `false`.
 * Returns `false` during SSR/first render before the effect measures width.
 */
export function useIsMobile() {
  // Start undefined (not false) so server and client renders agree; the
  // real value is set after mount to avoid a hydration mismatch.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)

    // Defer the first measurement by a tick so it never runs during render.
    const timeoutId = setTimeout(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
