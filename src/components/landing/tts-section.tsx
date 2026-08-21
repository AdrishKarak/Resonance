"use client";

import { useEffect } from "react";
import Image from "next/image";

/**
 * -----------------------------------------------------------------------------
 * TTS Product Section
 * -----------------------------------------------------------------------------
 * Showcases the core text-to-speech product via a browser-chrome-framed
 * screenshot of the Sonic Studio ("app.sonic.ai/studio"). It exists to give
 * visitors a concrete look at the actual editor UI right after the hero and
 * brand marquee. It is rendered in the landing page composition
 * (src/app/landing/page.tsx) between the Marquee and BentoGrid sections, and
 * its reveal animations are driven by an IntersectionObserver that adds the
 * `visible` class to `.reveal` children as they scroll into view.
 */

/**
 * Product showcase section with a framed TTS Studio screenshot.
 *
 * @returns A full-width section containing a "Product" eyebrow label, a
 *   headline, and a macOS-style browser frame wrapping the studio screenshot.
 */
export default function TtsSection() {
  // Scroll-reveal setup: observe every .reveal element inside this section
  // and toggle the `visible` class (defined in global CSS) when at least 12%
  // of the element enters the viewport. The observer is disconnected on
  // unmount to avoid leaks. Scoping the query to #tts-section keeps the
  // observer from touching other sections' elements.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll("#tts-section .reveal").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="tts-section"
      className="flex flex-col items-center gap-5 py-24 px-6 sm:px-12"
      style={{ background: "var(--sky-canvas)" }}
    >
      <span
        className="reveal font-medium text-xs tracking-[0.15em] uppercase"
        style={{
          fontFamily: "var(--font-body-family)",
          color: "var(--ink-muted)",
        }}
      >
        Product
      </span>

      <h2
        className="reveal font-bold text-center max-w-[600px]"
        style={{
          fontFamily: "var(--font-display-family)",
          color: "var(--ink)",
          fontSize: "clamp(28px, 4vw, 44px)",
          letterSpacing: "-0.03em",
          transitionDelay: "0.1s",
        }}
      >
        Everything you need to go from text to audio
      </h2>

      {/* Browser frame */}
      <div
        className="reveal tts-frame w-full max-w-[900px] rounded-[20px] overflow-hidden mt-6
                   border shadow-[0_32px_80px_rgba(56,189,248,0.12),0_8px_32px_rgba(10,10,10,0.06)]"
        style={{
          borderColor: "var(--glass-border)",
          transitionDelay: "0.2s",
        }}
      >
        {/* Browser chrome */}
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ background: "var(--ink-deep)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <div
            className="flex-1 mx-4 rounded-md px-3 py-1 text-[11px]"
            style={{
              background: "rgba(255, 255, 255, 0.10)",
              fontFamily: "var(--font-geist-mono), monospace",
              color: "rgba(255, 255, 255, 0.45)",
            }}
          >
            app.sonic.ai/studio
          </div>
        </div>

        {/* TTS screenshot */}
        <Image
          src="/TTSpage.jpeg"
          alt="Sonic TTS Studio"
          width={900}
          height={560}
          className="w-full h-auto block"
        />
      </div>
    </section>
  );
}
