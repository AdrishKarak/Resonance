"use client";

import { useEffect, useRef } from "react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

/**
 * -----------------------------------------------------------------------------
 * Landing Navbar
 * -----------------------------------------------------------------------------
 * Fixed, floating pill-shaped navigation bar for the landing page. It handles
 * two concerns: (1) a scroll-aware glass background that becomes more opaque
 * once the user scrolls past the hero, and (2) authentication UI driven by
 * Clerk — signed-out visitors see Sign in / Sign up modal triggers, while
 * signed-in users see their name and Clerk's <UserButton> avatar menu. It is
 * rendered at the top of the landing page composition
 * (src/app/landing/page.tsx) and stays pinned above all sections via z-50.
 */

/**
 * Sticky glass navbar with Clerk-powered auth controls.
 *
 * @returns A fixed-position navigation bar containing the Sonic logo link and
 *   either sign-in/sign-up buttons or the signed-in user's identity.
 */
export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const navRef = useRef<HTMLElement>(null);

  // Swap the nav's background between the translucent "at top" and more
  // opaque "scrolled" glass tokens so it remains legible over hero imagery
  // without permanently blocking it. The listener is passive since we only
  // read scroll position and never call preventDefault().
  useEffect(() => {
    const handleScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      if (window.scrollY > 40) {
        nav.style.background = "var(--glass-nav-scrolled)";
      } else {
        nav.style.background = "var(--glass-nav)";
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // Outer wrapper is pointer-events-none so the fixed full-width strip
    // doesn't block clicks on page content; only the inner <nav> re-enables
    // pointer events.
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-10 pt-4 pointer-events-none">
      <nav
        ref={navRef}
        className="pointer-events-auto w-full max-w-[1000px] flex items-center
                   justify-between px-4 sm:px-6 py-3 rounded-full
                   border border-white/80 backdrop-blur-xl
                   shadow-[0_4px_24px_rgba(56,189,248,0.10),0_1px_4px_rgba(10,10,10,0.06)]"
        style={{ background: "var(--glass-nav)" }}
      >
        {/* Logo + Name */}
        <Link href="/landing" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Sonic" width={32} height={32} />
          <span
            className="font-bold text-xl tracking-tight"
            style={{ fontFamily: "var(--font-display-family)", color: "var(--ink)" }}
          >
            Sonic
          </span>
        </Link>

        {/* Auth Controls — Clerk-driven: modal-based flows for guests,
            avatar + name for authenticated users */}
        {isSignedIn ? (
          <div className="flex items-center gap-2.5">
            <span
              className="hidden md:inline text-sm font-medium"
              style={{
                fontFamily: "var(--font-body-family)",
                color: "var(--ink)",
              }}
            >
              {user?.fullName || user?.firstName || "Account"}
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button
                className="rounded-lg px-4 py-2 text-sm font-medium transition-all
                           hover:-translate-y-px"
                style={{
                  fontFamily: "var(--font-body-family)",
                  color: "var(--ink)",
                }}
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                className="text-white rounded-lg px-4 py-2 text-sm font-medium
                           hover:-translate-y-px hover:shadow-lg transition-all"
                style={{ background: "var(--ink)" }}
              >
                Sign up
              </button>
            </SignUpButton>
          </div>
        )}
      </nav>
    </div>
  );
}

