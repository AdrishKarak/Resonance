/**
 * -----------------------------------------------------------------------------
 * Brand Marquee
 * -----------------------------------------------------------------------------
 * Renders an infinite horizontally-scrolling strip of well-known brand names
 * (Spotify, YouTube, Stripe, etc.) used as lightweight "social proof" on the
 * landing page. It exists to build credibility without requiring real logos or
 * testimonials. It is rendered directly below the Hero section in the landing
 * page composition (src/app/landing/page.tsx), sitting between the hero and
 * the TTS product section.
 */

// Static list of brand names displayed in the marquee. Purely decorative —
// these are aspirational references, not actual integrations.
const brands = [
  "Spotify",
  "YouTube",
  "Audible",
  "Notion",
  "Linear",
  "Vercel",
  "Stripe",
  "Shopify",
  "Discord",
  "Figma",
];

/**
 * Infinite brand marquee strip.
 *
 * @returns A full-width, glass-styled band containing a continuously
 *   scrolling row of brand names.
 */
export default function Marquee() {
  // Duplicate the brands array so the CSS `marquee` keyframe (defined in the
  // global stylesheet) can translate the track by -50% and loop seamlessly:
  // when the first copy has fully scrolled out of view, the second copy is in
  // exactly the same position the first started at, making the loop invisible.
  const items = [...brands, ...brands];

  return (
    <div
      className="overflow-hidden py-4"
      style={{
        borderTop: "1px solid var(--glass-border)",
        borderBottom: "1px solid var(--glass-border)",
        background: "rgba(255, 255, 255, 0.40)",
      }}
    >
      {/* `w-max` keeps the track as wide as its content so both copies sit
          side by side; the keyframe animation drives the seamless loop. */}
      <div
        className="flex gap-12 w-max"
        style={{ animation: "marquee 22s linear infinite" }}
      >
        {items.map((brand, i) => (
          // Index is appended to the key because brand names repeat in the
          // duplicated array; a plain brand string would collide.
          <span
            key={`${brand}-${i}`}
            className="text-sm font-medium whitespace-nowrap flex items-center gap-4"
            style={{
              fontFamily: "var(--font-display-family)",
              color: "var(--ink-muted)",
            }}
          >
            {brand}
            <span className="text-xs opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
