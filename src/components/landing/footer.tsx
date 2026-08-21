"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * -----------------------------------------------------------------------------
 * Landing Footer
 * -----------------------------------------------------------------------------
 * The site footer for the marketing/landing experience: logo, dynamic
 * copyright year, and placeholder legal/docs links. It exists to close out
 * the landing page with standard navigational and branding elements. It is
 * rendered as the last section of the landing page composition
 * (src/app/landing/page.tsx), after the Pricing section.
 */

/**
 * Landing page footer with logo, copyright, and utility links.
 *
 * @returns A glass-styled footer bar containing the Sonic logo (linking back
 *   to /landing), the current-year copyright notice, and Privacy/Terms/Docs
 *   placeholder links.
 */
export default function Footer() {
  return (
    <footer
      className="px-6 sm:px-12 py-8"
      style={{
        borderTop: "1px solid var(--glass-border)",
        background: "rgba(255,255,255,0.35)",
      }}
    >
      <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Sonic" width={24} height={24} />
          <span
            className="font-bold text-sm"
            style={{
              fontFamily: "var(--font-display-family)",
              color: "var(--ink)",
            }}
          >
            Sonic
          </span>
        </Link>

        {/* Copyright */}
        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-body-family)",
            color: "var(--ink-muted)",
          }}
        >
          © {new Date().getFullYear()} Sonic. All rights reserved.
        </p>

        {/* Links — placeholder anchors; hover color is set imperatively
            because the muted/ink colors come from CSS variables that plain
            Tailwind hover: utilities can't reference here. */}
        <div className="flex items-center gap-5">
          {["Privacy", "Terms", "Docs"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs transition-colors"
              style={{
                fontFamily: "var(--font-body-family)",
                color: "var(--ink-muted)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--ink-muted)")
              }
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
