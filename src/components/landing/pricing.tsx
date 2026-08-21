"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Type, Sparkles, Zap, ArrowRight } from "lucide-react";

/**
 * -----------------------------------------------------------------------------
 * Pricing Section (Usage-Based)
 * -----------------------------------------------------------------------------
 * Presents Sonic's usage-based pricing model: a hero "$0 / no subscription"
 * card alongside per-feature rate rows (TTS generation, voice cloning, free
 * exploration). It exists to communicate that visitors can explore for free
 * and only pay when they synthesize or clone, with billing handled by Polar.
 * It is rendered in the landing page composition
 * (src/app/landing/page.tsx) after the BentoGrid and before the Footer. The
 * section is a client component because it reads Clerk auth state to route
 * the CTA and runs an IntersectionObserver for scroll-reveal animations.
 */

// The three pay-as-you-go line items shown as rate cards on the right side of
// the grid. Each entry is paired with an animated SVG illustration via the
// `rateIcons` index mapping below.
const usageRates = [
  {
    icon: Type,
    label: "TTS Generation",
    rate: "$0.03",
    per: "per 100 words",
    desc: "Only pay when you synthesize speech",
  },
  {
    icon: Sparkles,
    label: "Voice Cloning",
    rate: "$0.25",
    per: "per custom voice",
    desc: "Create high-fidelity digital clones",
  },
  {
    icon: Zap,
    label: "Exploration",
    rate: "Free",
    per: "always",
    desc: "Test features & hear voices for free",
  },
];

// ─── SVG Illustrations ───────────────────────────────────────────────────────
// Self-contained SMIL-animated SVGs (no JS animation loop needed) used as the
// animated "icons" for each rate row. Each visualizes its pricing concept:
// sound waves for TTS, a DNA helix for cloning, an orbiting bolt for free
// exploration.

/** Sound waves radiating from a central dot — "TTS" */
function TTSAnimation() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      {/* Core dot */}
      <circle cx="36" cy="36" r="5" fill="#38bdf8">
        <animate attributeName="r" values="5;7;5" dur="1.4s" repeatCount="indefinite" />
      </circle>

      {/* Wave ring 1 */}
      <circle cx="36" cy="36" r="12" stroke="#38bdf8" strokeWidth="1.8" opacity="0">
        <animate attributeName="r" values="12;22;12" dur="1.8s" repeatCount="indefinite" begin="0s" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" begin="0s" />
      </circle>
      {/* Wave ring 2 */}
      <circle cx="36" cy="36" r="12" stroke="#0ea5e9" strokeWidth="1.4" opacity="0">
        <animate attributeName="r" values="12;28;12" dur="1.8s" repeatCount="indefinite" begin="0.4s" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" begin="0.4s" />
      </circle>
      {/* Wave ring 3 */}
      <circle cx="36" cy="36" r="12" stroke="#7dd3fc" strokeWidth="1" opacity="0">
        <animate attributeName="r" values="12;34;12" dur="1.8s" repeatCount="indefinite" begin="0.8s" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" begin="0.8s" />
      </circle>

      {/* Waveform bars — left */}
      <rect x="6" y="29" width="3" height="14" rx="1.5" fill="#38bdf8">
        <animate attributeName="height" values="14;6;14" dur="0.9s" repeatCount="indefinite" begin="0s" />
        <animate attributeName="y" values="29;33;29" dur="0.9s" repeatCount="indefinite" begin="0s" />
      </rect>
      <rect x="12" y="24" width="3" height="24" rx="1.5" fill="#0ea5e9">
        <animate attributeName="height" values="24;10;24" dur="0.7s" repeatCount="indefinite" begin="0.15s" />
        <animate attributeName="y" values="24;31;24" dur="0.7s" repeatCount="indefinite" begin="0.15s" />
      </rect>
      <rect x="18" y="27" width="3" height="18" rx="1.5" fill="#38bdf8">
        <animate attributeName="height" values="18;8;18" dur="1.1s" repeatCount="indefinite" begin="0.3s" />
        <animate attributeName="y" values="27;32;27" dur="1.1s" repeatCount="indefinite" begin="0.3s" />
      </rect>

      {/* Waveform bars — right */}
      <rect x="51" y="27" width="3" height="18" rx="1.5" fill="#38bdf8">
        <animate attributeName="height" values="18;8;18" dur="1s" repeatCount="indefinite" begin="0.2s" />
        <animate attributeName="y" values="27;32;27" dur="1s" repeatCount="indefinite" begin="0.2s" />
      </rect>
      <rect x="57" y="24" width="3" height="24" rx="1.5" fill="#0ea5e9">
        <animate attributeName="height" values="24;12;24" dur="0.75s" repeatCount="indefinite" begin="0.05s" />
        <animate attributeName="y" values="24;30;24" dur="0.75s" repeatCount="indefinite" begin="0.05s" />
      </rect>
      <rect x="63" y="29" width="3" height="14" rx="1.5" fill="#38bdf8">
        <animate attributeName="height" values="14;6;14" dur="0.95s" repeatCount="indefinite" begin="0.4s" />
        <animate attributeName="y" values="29;33;29" dur="0.95s" repeatCount="indefinite" begin="0.4s" />
      </rect>
    </svg>
  );
}

/** DNA double-helix — "Voice Cloning" */
function CloningAnimation() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      {/* Left strand */}
      <path
        d="M22 6 Q36 18 22 30 Q8 42 22 54 Q36 66 22 78"
        stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round"
      >
        <animate attributeName="d"
          values="M22 6 Q36 18 22 30 Q8 42 22 54 Q36 66 22 78;
                  M22 6 Q8 18 22 30 Q36 42 22 54 Q8 66 22 78;
                  M22 6 Q36 18 22 30 Q8 42 22 54 Q36 66 22 78"
          dur="2s" repeatCount="indefinite" />
      </path>
      {/* Right strand */}
      <path
        d="M50 6 Q36 18 50 30 Q64 42 50 54 Q36 66 50 78"
        stroke="#0ea5e9" strokeWidth="2" fill="none" strokeLinecap="round"
      >
        <animate attributeName="d"
          values="M50 6 Q36 18 50 30 Q64 42 50 54 Q36 66 50 78;
                  M50 6 Q64 18 50 30 Q36 42 50 54 Q64 66 50 78;
                  M50 6 Q36 18 50 30 Q64 42 50 54 Q36 66 50 78"
          dur="2s" repeatCount="indefinite" />
      </path>
      {/* Cross-links */}
      {[18, 30, 42, 54].map((y, i) => (
        <line key={y} x1="22" y1={y} x2="50" y2={y} stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
        </line>
      ))}
      {/* Pulsing nodes */}
      {[18, 30, 42, 54].map((y, i) => (
        <circle key={`n${y}`} cx="36" cy={y} r="2.5" fill="#38bdf8">
          <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
        </circle>
      ))}
    </svg>
  );
}

/** Zap orbiting a ring — "Free Exploration" */
function ExplorationAnimation() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      {/* Orbit ring */}
      <circle cx="36" cy="36" r="24" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="6 4" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 36 36" to="360 36 36" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Inner pulsing ring */}
      <circle cx="36" cy="36" r="14" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 5" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" from="360 36 36" to="0 36 36" dur="5s" repeatCount="indefinite" />
      </circle>

      {/* Central bolt */}
      <polygon points="36,20 28,38 35,38 30,52 44,32 37,32 42,20" fill="#38bdf8">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" additive="sum"
          values="1 1;1.05 1.05;1 1" dur="1.2s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
      </polygon>

      {/* Orbiting dot */}
      <circle cx="60" cy="36" r="4" fill="#7dd3fc">
        <animateTransform attributeName="transform" type="rotate" from="0 36 36" to="360 36 36" dur="3s" repeatCount="indefinite" />
        <animate attributeName="r" values="4;5.5;4" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Spark particles */}
      {[0, 90, 180, 270].map((angle, i) => (
        <circle key={i} cx={36 + 24 * Math.cos((angle * Math.PI) / 180)} cy={36 + 24 * Math.sin((angle * Math.PI) / 180)} r="2" fill="#38bdf8">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
        </circle>
      ))}
    </svg>
  );
}

/** Big hero SVG — "Free to explore" card background */
function HeroBgSVG() {
  return (
    <svg
      width="340" height="200"
      viewBox="0 0 340 200"
      fill="none"
      style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.07, pointerEvents: "none" }}
    >
      {/* Concentric arcs */}
      {[40, 70, 100, 130, 160].map((r, i) => (
        <circle key={r} cx="310" cy="170" r={r} stroke="#0ea5e9" strokeWidth="1.2">
          <animate attributeName="r" values={`${r};${r + 8};${r}`} dur={`${3 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
          <animate attributeName="opacity" values="1;0.4;1" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
        </circle>
      ))}
      {/* Grid lines */}
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={i * 85} y1="0" x2={i * 85} y2="200" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4 6" />
      ))}
      {[0, 1, 2].map(i => (
        <line key={i} x1="0" y1={i * 100} x2="340" y2={i * 100} stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4 6" />
      ))}
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

// Maps each usageRates entry (by index) to its animated SVG illustration,
// keeping the data array free of JSX.
const rateIcons = [TTSAnimation, CloningAnimation, ExplorationAnimation];

/**
 * Usage-based pricing section with hero card, rate rows, and auth-aware CTA.
 *
 * @returns The pricing section: a "$0 subscription" hero card, three animated
 *   rate rows mapped from `usageRates`, and a CTA button that routes
 *   signed-in users to the app and guests to sign-up.
 */
export default function Pricing() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-reveal: observe all .reveal descendants and add the `visible`
  // class when they enter the viewport (threshold 12%). Scoped to this
  // section's ref so other sections' reveal elements are untouched; the
  // observer is disconnected on unmount to prevent leaks.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      { threshold: 0.12 }
    );
    sectionRef.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    // Scoped <style> blocks keep this section's reveal/hover/CTA styles
    // self-contained without a separate CSS module; the second block handles
    // the responsive single-column collapse below 680px.
    <>
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        .price-card {
          border-radius: 6px;
          border: 1px solid #bae6fd;
          background: #ffffff;
          position: relative;
          overflow: hidden;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .price-card:hover {
          border-color: #7dd3fc;
          box-shadow: 0 8px 32px rgba(14,165,233,0.13);
          transform: translateY(-2px);
        }

        .rate-row {
          border-radius: 6px;
          border: 1px solid #bae6fd;
          background: #ffffff;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 18px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .rate-row:hover {
          border-color: #7dd3fc;
          box-shadow: 0 6px 24px rgba(14,165,233,0.1);
          transform: translateY(-2px);
        }

        .accent-bar {
          position: absolute;
          top: 0; left: 28px;
          width: 36px; height: 2px;
          background: #0ea5e9;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .cta-btn:hover {
          background: #0ea5e9;
          box-shadow: 0 8px 28px rgba(14,165,233,0.35);
          transform: translateY(-1px);
        }
        .cta-btn svg { transition: transform 0.2s ease; }
        .cta-btn:hover svg { transform: translateX(3px); }
      `}</style>

      <section
        id="pricing"
        ref={sectionRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          padding: "96px 24px",
          background: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <span
          className="reveal"
          style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#0ea5e9", marginBottom: 16 }}
        >
          Pricing
        </span>

        <h2
          className="reveal"
          style={{
            fontWeight: 700, textAlign: "center", maxWidth: 520,
            marginBottom: 12,
            fontSize: "clamp(28px, 4vw, 44px)",
            letterSpacing: "-0.035em", color: "#0f172a", lineHeight: 1.15,
            transitionDelay: "0.08s",
          }}
        >
          Pay only for what you use
        </h2>

        <p
          className="reveal"
          style={{
            fontSize: 15, maxWidth: 460, textAlign: "center",
            color: "#64748b", lineHeight: 1.7, marginBottom: 56,
            transitionDelay: "0.14s",
          }}
        >
          Browsing voices and testing features are always free. Pay only when you synthesize or clone.
        </p>

        {/* ── Main grid: hero card left, rate cards right ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            width: "100%",
            maxWidth: 900,
          }}
          className="pricing-grid"
        >
          {/* Hero "Free to explore" card */}
          <div
            className="reveal price-card"
            style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 340, transitionDelay: "0.2s" }}
          >
            <div className="accent-bar" />
            <HeroBgSVG />

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", color: "#0f172a" }}>
                  Free to explore
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "#0ea5e9", padding: "3px 9px",
                  border: "1px solid rgba(14,165,233,0.3)", borderRadius: 2,
                }}>
                  Always free
                </span>
              </div>

              <div style={{
                padding: "14px 16px", borderRadius: 4,
                background: "rgba(14,165,233,0.04)",
                border: "1px solid rgba(14,165,233,0.1)",
                fontSize: 13.5, color: "#334155", lineHeight: 1.65,
              }}>
                <strong style={{ color: "#0f172a" }}>No subscription required.</strong> Create an account, browse all voices, and test the full platform at zero cost.
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 24, marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.04em", color: "#0f172a", lineHeight: 1 }}>$0</span>
                <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>subscription fee</span>
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                Billed securely based on strict usage via Polar.
              </p>
            </div>
          </div>

          {/* Rate rows stacked — each row's illustration is picked by index
              from `rateIcons`; transitionDelay staggers the reveal cascade */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {usageRates.map((item, i) => {
              const Anim = rateIcons[i];
              return (
                <div
                  key={item.label}
                  className="reveal rate-row"
                  style={{ transitionDelay: `${0.26 + i * 0.08}s`, position: "relative" }}
                >
                  <div className="accent-bar" />
                  {/* Animated icon */}
                  <div style={{ flexShrink: 0, width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Anim />
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>{item.label}</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#0ea5e9", letterSpacing: "-0.02em" }}>
                        {item.rate}
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginLeft: 4 }}>{item.per}</span>
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}

            {/* CTA inline — auth-aware routing: signed-in users land in the
                app, guests are sent to sign-up */}
            <div className="reveal" style={{ transitionDelay: "0.52s", paddingTop: 4 }}>
              <button
                className="cta-btn"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => router.push(isSignedIn ? "/" : "/sign-up")}
              >
                <span>Start free — no card required</span>
                <ArrowRight size={16} />
              </button>
              <p style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
                Secure billing via{" "}
                <a href="https://polar.sh" target="_blank" rel="noopener noreferrer"
                  style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
                  Polar ↗
                </a>
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 680px) {
            .pricing-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  );
}