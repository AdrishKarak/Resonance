"use client";

import { useEffect, useRef } from "react";

/**
 * -----------------------------------------------------------------------------
 * Hero Title (Word-by-Word Reveal)
 * -----------------------------------------------------------------------------
 * The animated <h1> headline of the landing page hero. It exists to deliver a
 * staggered word-by-word entrance animation: on mount, a DOM walk wraps every
 * word in an inline-block span with an incremental animation-delay, letting
 * the global `hero-word` CSS keyframe fade/slide each word in sequence. It is
 * rendered inside the Hero component (src/components/landing/hero.tsx),
 * between the announcement badge and the subtitle.
 */

/**
 * Animated hero headline with per-word entrance staggering.
 *
 * @returns An <h1> whose text content is split into individually animated
 *   word spans after mount.
 */
export default function HeroTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Post-mount DOM walk: rather than hardcoding word spans in JSX, we
  // traverse the rendered heading and split each text node on whitespace.
  // This keeps the markup readable while still enabling per-word delays.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    let wordIndex = 0;
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split keeping whitespace tokens so spacing between words survives
        // the span-wrapping (capturing groups keep separators in the array).
        const words = node.textContent!.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach((w) => {
          if (/\S/.test(w)) {
            // Each real word becomes an animatable span; delay grows by
            // 80ms per word so words cascade left-to-right.
            const span = document.createElement("span");
            span.className = "hero-word inline-block";
            span.style.animationDelay = `${wordIndex * 0.08 + 0.05}s`;
            span.textContent = w;
            frag.appendChild(span);
            wordIndex++;
          } else {
            frag.appendChild(document.createTextNode(w));
          }
        });
        node.parentNode!.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Recurse into child elements (e.g. the "highlight" span) so nested
        // text gets wrapped too.
        Array.from(node.childNodes).forEach(walk);
      }
    };
    Array.from(el.childNodes).forEach(walk);
  }, []);

  return (
    <h1
      ref={titleRef}
      className="font-bold text-center leading-[1.05] max-w-[820px] mb-6"
      style={{
        fontFamily: "var(--font-display-family)",
        color: "var(--ink)",
        fontSize: "clamp(36px, 6vw, 72px)",
        letterSpacing: "-0.05em",
      }}
    >
      Turn any text into{" "}
      <span className="highlight relative inline-block">natural speech</span>{" "}
      in seconds
    </h1>
  );
}
