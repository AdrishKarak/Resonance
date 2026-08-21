"use client";

import { useEffect, useRef } from "react";

/**
 * -----------------------------------------------------------------------------
 * Decorative Waveform
 * -----------------------------------------------------------------------------
 * A purely decorative animated audio waveform rendered as a row of thin
 * vertical bars that pulse via the global `wave` CSS keyframe. It exists to
 * reinforce the "audio/voice" theme beneath the hero CTAs without shipping
 * any real audio visualization. It is rendered inside the Hero component
 * (src/components/landing/hero.tsx), between the CTA row and the dashboard
 * screenshot. Marked aria-hidden since it carries no semantic meaning.
 */

/**
 * Animated decorative waveform of pulsing bars.
 *
 * @returns An empty flex container that is populated on mount with 38
 *   randomly-sized, randomly-delayed animated bar divs.
 */
export default function Waveform() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Bars are generated imperatively (rather than via JSX map) so each one can
  // get randomized inline styles; the container is cleared first to stay idempotent.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    for (let i = 0; i < 38; i++) {
      const bar = document.createElement("div");
      bar.style.width = "3px";
      bar.style.background = "var(--ink)";
      bar.style.borderRadius = "2px";
      // Random resting height (8–40px) so the waveform looks organic.
      bar.style.height = `${Math.random() * 32 + 8}px`;
      // Random delay/duration desynchronize the bars so they don't pulse in
      // unison — the `wave` keyframe scales each bar's height over time.
      bar.style.animationDelay = `${Math.random() * 1.2}s`;
      bar.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
      bar.style.opacity = `${0.45 + Math.random() * 0.5}`;
      bar.style.animation = `wave ${0.8 + Math.random() * 0.8}s ease-in-out ${Math.random() * 1.2}s infinite`;
      container.appendChild(bar);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-[3px] justify-center"
      style={{ animation: "fadeSlideUp 0.8s 0.9s ease both" }}
      aria-hidden="true"
    />
  );
}
