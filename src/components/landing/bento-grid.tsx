"use client";

import { useEffect, useRef } from "react";
import { Mic, Zap, Globe, Headphones, Sparkles } from "lucide-react";

/**
 * -----------------------------------------------------------------------------
 * Features Bento Grid
 * -----------------------------------------------------------------------------
 * The "Features" section of the landing page: a responsive bento-style grid
 * of five feature cards (voice library, contextual modes, voice cloning,
 * in-platform recording, pay-as-you-go). It exists to enumerate the product's
 * capabilities with light/dark card variants, animated SVG illustrations,
 * 3D tilt-on-hover for standard cards, and a flip-card treatment for the
 * pricing feature. It is rendered in the landing page composition
 * (src/app/landing/page.tsx) between the TTS section and Pricing.
 */

// Feature card data. Layout/appearance is driven by flags:
// - `wide`: spans two grid columns
// - `dark`: renders the dark card variant
// - `flip`: renders a hover-flip card using the back* fields instead of a
//   tilt-on-hover standard card
const features = [
  {
    icon: Globe,
    title: "Global Voice Library",
    desc: "20+ sample voices from various countries including the UK, USA, India, Canada, Australia, and Russia.",
    wide: true,
    dark: false,
    flip: false,
  },
  {
    icon: Headphones,
    title: "Contextual Modes",
    desc: "Specify the exact delivery style you need—from professional narration to casual conversation or podcasting.",
    wide: false,
    dark: true,
    flip: false,
  },
  {
    icon: Sparkles,
    title: "Instant Voice Cloning",
    desc: "Clone your own custom voice with just 10+ seconds of audio. Your digital twin, ready in seconds.",
    wide: false,
    dark: false,
    flip: false,
  },
  {
    icon: Mic,
    title: "In-Platform Recording",
    desc: "Record your audio samples directly within the platform. No external recording software required.",
    wide: false,
    dark: false,
    flip: false,
  },
  {
    icon: Zap,
    title: "Pay As You Go",
    desc: "Pay only for what you use, no extra charges. Synthesize up to 5,000 characters at a time.",
    wide: false,
    dark: true,
    flip: true,
    backTitle: "Transparent Usage",
    backCode: `Max Request: 5000 chars\nBase Fee: $0\nSubscriptions: None`,
    backBadge: "True Flexibility",
  },
];

// --- Animated SVG Illustrations ---
// Decorative SMIL-animated SVGs, one per feature card (matched by index via
// the `illustrations` array). Each is positioned absolutely in the card's
// bottom-right corner at low opacity so it reads as background texture.

function GlobeIllustration() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" fill="none" className="absolute bottom-4 right-4 opacity-[0.13]">
      <circle cx="55" cy="55" r="48" stroke="#0ea5e9" strokeWidth="1.5" />
      <ellipse cx="55" cy="55" rx="24" ry="48" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="7" y1="55" x2="103" y2="55" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="55" y1="7" x2="55" y2="103" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 3" />
      <circle cx="55" cy="55" r="3" fill="#0ea5e9" />
      <circle cx="30" cy="35" r="2" fill="#38bdf8">
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" begin="0s" />
      </circle>
      <circle cx="78" cy="42" r="2" fill="#38bdf8">
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <circle cx="40" cy="70" r="2" fill="#38bdf8">
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
      </circle>
      <circle cx="72" cy="68" r="2" fill="#38bdf8">
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" begin="1.8s" />
      </circle>
    </svg>
  );
}

function HeadphonesIllustration() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" className="absolute bottom-4 right-4 opacity-[0.15]">
      <path d="M15 48 C15 27 27 15 45 15 C63 15 75 27 75 48" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="44" width="14" height="22" rx="5" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="68" y="44" width="14" height="22" rx="5" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="30" y1="58" x2="30" y2="50" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y1" values="58;52;58" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y2" values="50;44;50" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="38" y1="58" x2="38" y2="44" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y1" values="58;55;58" dur="0.8s" repeatCount="indefinite" begin="0.1s" />
        <animate attributeName="y2" values="44;40;44" dur="0.8s" repeatCount="indefinite" begin="0.1s" />
      </line>
      <line x1="46" y1="58" x2="46" y2="46" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y1" values="58;53;58" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
        <animate attributeName="y2" values="46;38;46" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
      </line>
      <line x1="54" y1="58" x2="54" y2="48" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y1" values="58;54;58" dur="0.9s" repeatCount="indefinite" begin="0.3s" />
        <animate attributeName="y2" values="48;42;48" dur="0.9s" repeatCount="indefinite" begin="0.3s" />
      </line>
      <line x1="62" y1="58" x2="62" y2="52" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y1" values="58;52;58" dur="1.1s" repeatCount="indefinite" begin="0.4s" />
        <animate attributeName="y2" values="52;46;52" dur="1.1s" repeatCount="indefinite" begin="0.4s" />
      </line>
    </svg>
  );
}

function SparklesIllustration() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="absolute bottom-4 right-4 opacity-[0.13]">
      <path d="M30 15 Q50 30 30 45 Q10 60 30 75 Q50 90 30 100" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="5 3" fill="none" />
      <path d="M70 15 Q50 30 70 45 Q90 60 70 75 Q50 90 70 100" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 3" fill="none" />
      <line x1="35" y1="22" x2="65" y2="22" stroke="#0ea5e9" strokeWidth="1" opacity="0.6" />
      <line x1="26" y1="38" x2="74" y2="38" stroke="#0ea5e9" strokeWidth="1" opacity="0.6" />
      <line x1="26" y1="54" x2="74" y2="54" stroke="#0ea5e9" strokeWidth="1" opacity="0.6" />
      <line x1="35" y1="70" x2="65" y2="70" stroke="#0ea5e9" strokeWidth="1" opacity="0.6" />
      <circle cx="50" cy="38" r="3" fill="#38bdf8">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="54" r="3" fill="#0ea5e9">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" begin="1s" />
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" begin="1s" />
      </circle>
    </svg>
  );
}

function MicIllustration() {
  return (
    <svg width="90" height="100" viewBox="0 0 90 100" fill="none" className="absolute bottom-4 right-4 opacity-[0.13]">
      <rect x="32" y="10" width="26" height="42" rx="13" stroke="#0ea5e9" strokeWidth="1.5" />
      <path d="M18 50 C18 68 72 68 72 50" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="45" y1="68" x2="45" y2="84" stroke="#0ea5e9" strokeWidth="1.5" />
      <line x1="30" y1="84" x2="60" y2="84" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="45" cy="31" r="8" stroke="#38bdf8" strokeWidth="1" opacity="0">
        <animate attributeName="r" values="8;22;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="45" cy="31" r="8" stroke="#38bdf8" strokeWidth="1" opacity="0">
        <animate attributeName="r" values="8;22;8" dur="2s" repeatCount="indefinite" begin="0.7s" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" begin="0.7s" />
      </circle>
    </svg>
  );
}

function ZapIllustration() {
  return (
    <svg width="90" height="100" viewBox="0 0 90 100" fill="none" className="absolute bottom-4 right-4 opacity-[0.18]">
      <polyline points="52,10 30,52 48,52 38,90 70,40 50,40 66,10" stroke="#38bdf8" strokeWidth="1.8" strokeLinejoin="round" fill="none">
        <animate attributeName="stroke-dasharray" values="0 200;200 0" dur="1.8s" repeatCount="indefinite" />
      </polyline>
      <circle cx="50" cy="50" r="30" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 4" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// Index-matched to the `features` array so each card can pull its
// illustration component without embedding JSX in the data.
const illustrations = [
  GlobeIllustration,
  HeadphonesIllustration,
  SparklesIllustration,
  MicIllustration,
  ZapIllustration,
];

/**
 * Features bento grid with scroll reveals, tilt cards, and a flip card.
 *
 * @returns The features section: an eyebrow label, headline, and a responsive
 *   grid of five feature cards rendered from the `features` data.
 */
export default function BentoGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-reveal: add the `visible` class (defined in this file's scoped
  // <style>) to .reveal elements as they enter the viewport at 12% visibility.
  // Disconnected on unmount to avoid leaks.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    sectionRef.current
      ?.querySelectorAll(".reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 3D tilt-on-hover: map the cursor position within the card to a small
  // rotateX/rotateY around a shared perspective, plus a slight lift. Flip
  // cards are excluded (isFlip) since their transform is owned by the CSS
  // flip animation.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, isFlip: boolean) => {
    if (isFlip) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    // Normalize cursor to [-0.5, 0.5] from the card center so rotation is
    // symmetric in both axes.
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-3px)`;
  };

  // Reset the inline transform so the CSS transition eases the card back to
  // its resting state on mouse leave.
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, isFlip: boolean) => {
    if (isFlip) return;
    e.currentTarget.style.transform = "";
  };

  return (
    <>
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .bento-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          border-radius: 6px;
          padding: 28px;
          min-height: 200px;
        }
        .bento-card-light {
          background: #ffffff;
          border: 1px solid #bae6fd;
          box-shadow: 0 2px 12px rgba(14, 165, 233, 0.06);
        }
        .bento-card-light:hover {
          box-shadow: 0 8px 32px rgba(14, 165, 233, 0.12);
          border-color: #7dd3fc;
        }
        .bento-card-dark {
          background: #09090b;
          border: 1px solid rgba(56, 189, 248, 0.2);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .bento-card-dark:hover {
          box-shadow: 0 8px 32px rgba(14, 165, 233, 0.1);
          border-color: rgba(56, 189, 248, 0.5);
        }
        .icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .icon-badge-light {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
        }
        .icon-badge-dark {
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.15);
        }
        .card-accent-line {
          position: absolute;
          top: 0;
          left: 28px;
          width: 32px;
          height: 2px;
          background: #0ea5e9;
        }
        .card-title {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
          line-height: 1.3;
        }
        .card-title-light { color: #0f172a; }
        .card-title-dark  { color: #f8fafc; }
        .card-desc {
          font-size: 13.5px;
          line-height: 1.65;
        }
        .card-desc-light { color: #64748b; }
        .card-desc-dark  { color: rgba(255,255,255,0.5); }

        /* Flip */
        .flip-card {
          perspective: 1000px;
          min-height: 200px;
        }
        .flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 200px;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        .flip-card:hover .flip-inner {
          transform: rotateY(180deg);
        }
        .flip-front,
        .flip-back {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 6px;
          padding: 28px;
          overflow: hidden;
        }
        .flip-front {
          background: #09090b;
          border: 1px solid rgba(56, 189, 248, 0.2);
        }
        .flip-back {
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #020617;
          border: 1px solid rgba(56, 189, 248, 0.4);
        }
        .code-block {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12px;
          line-height: 1.8;
          color: #38bdf8;
          background: rgba(56,189,248,0.05);
          border: 1px solid rgba(56,189,248,0.12);
          border-radius: 4px;
          padding: 12px 14px;
          white-space: pre;
        }
        .flip-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #0ea5e9;
          padding: 3px 8px;
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: 2px;
          display: inline-block;
          width: fit-content;
        }

        /* Grid */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
          max-width: 960px;
        }
        .wide-card { grid-column: span 2; }
        @media (max-width: 1023px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .bento-grid { grid-template-columns: 1fr; }
          .wide-card { grid-column: span 1; }
        }
      `}</style>

      <section
        id="features"
        ref={sectionRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "96px 24px",
          background: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <span
          className="reveal"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#0ea5e9",
          }}
        >
          Features
        </span>

        <h2
          className="reveal"
          style={{
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 520,
            marginBottom: 24,
            fontSize: "clamp(26px, 4vw, 40px)",
            letterSpacing: "-0.035em",
            color: "#0f172a",
            lineHeight: 1.15,
            transitionDelay: "0.08s",
          }}
        >
          Everything your voice needs
        </h2>

        <div className="bento-grid">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            // Illustration component is matched to the feature by array index.
            const Illustration = illustrations[i];
            // Stagger each card's reveal by 70ms for a cascading entrance.
            const delay = `${0.08 + i * 0.07}s`;

            if (feature.flip) {
              // Flip card variant: CSS 3D rotateY(180deg) on hover swaps the
              // front (feature pitch) for the back (pricing details + code
              // block + badge). backface-visibility hides the inactive face.
              return (
                <div
                  key={feature.title}
                  className="reveal flip-card"
                  style={{ transitionDelay: delay }}
                >
                  <div className="flip-inner">
                    <div className="flip-front">
                      <div className="card-accent-line" />
                      <Illustration />
                      <div className="icon-badge icon-badge-dark">
                        <Icon size={18} color="#38bdf8" />
                      </div>
                      <div className="card-title card-title-dark">{feature.title}</div>
                      <div className="card-desc card-desc-dark">{feature.desc}</div>
                    </div>
                    <div className="flip-back">
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc", letterSpacing: "-0.01em" }}>
                        {feature.backTitle}
                      </div>
                      <pre className="code-block">{feature.backCode}</pre>
                      <div className="flip-badge">{feature.backBadge}</div>
                    </div>
                  </div>
                </div>
              );
            }

            // Standard card variant: light or dark theme, optional 2-column
            // span, with tilt-on-hover handlers (flip flag passed as false).
            return (
              <div
                key={feature.title}
                className={`reveal bento-card ${feature.dark ? "bento-card-dark" : "bento-card-light"} ${feature.wide ? "wide-card" : ""}`}
                style={{ transitionDelay: delay }}
                onMouseMove={(e) => handleMouseMove(e, false)}
                onMouseLeave={(e) => handleMouseLeave(e, false)}
              >
                <div className="card-accent-line" />
                <Illustration />
                <div className={`icon-badge ${feature.dark ? "icon-badge-dark" : "icon-badge-light"}`}>
                  <Icon size={18} color={feature.dark ? "#38bdf8" : "#0ea5e9"} />
                </div>
                <div className={`card-title ${feature.dark ? "card-title-dark" : "card-title-light"}`}>
                  {feature.title}
                </div>
                <div className={`card-desc ${feature.dark ? "card-desc-dark" : "card-desc-light"}`}>
                  {feature.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}