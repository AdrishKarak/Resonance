"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Play, ArrowRight } from "lucide-react";
import HeroTitle from "./hero-title";
import Waveform from "./waveform";

/**
 * -----------------------------------------------------------------------------
 * Landing Hero
 * -----------------------------------------------------------------------------
 * The full-viewport hero section at the top of the landing page. It combines
 * an illustrated background with readability overlays, an announcement badge,
 * the animated headline (HeroTitle), a subtitle, two auth-aware CTA buttons,
 * a decorative waveform, and a dashboard screenshot preview. It exists to
 * communicate the product's value proposition in one screen and route
 * visitors into the app (or sign-up) based on their Clerk auth state. It is
 * rendered first in the landing page composition
 * (src/app/landing/page.tsx), directly below the fixed Navbar.
 */

/**
 * Landing hero section with animated title, CTAs, and product preview.
 *
 * @returns The hero section markup including background imagery, badge,
 *   headline, subtitle, CTA row, waveform, and dashboard screenshot.
 */
export default function Hero() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  // Primary CTA: authenticated users go straight to the app root; guests are
  // funneled into sign-up first.
  const handleStart = () => {
    router.push(isSignedIn ? "/" : "/sign-up");
  };

  // Secondary CTA: signed-in users can browse voices immediately; guests must
  // sign in before hearing a demo.
  const handleDemo = () => {
    router.push(isSignedIn ? "/voices" : "/sign-in");
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 sm:px-12 pt-36 pb-16 overflow-hidden">
      {/* Illustrated Background — sits at z-0 behind content; `priority`
          ensures the LCP image is preloaded. A translucent white overlay
          keeps text readable and a gradient fades the image into the page's
          sky-canvas background so the hero blends into the next section. */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-bottom"
          sizes="100vw"
        />
        {/* White overlay for text readability */}
        <div className="absolute inset-0 bg-white/20" />
        {/* Bottom fade into page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{
            background: "linear-gradient(to top, var(--sky-canvas), transparent)",
          }}
        />
      </div>

      {/* Content — z-10 above the background; each child uses a staggered
          fadeSlideUp/Down keyframe delay to choreograph the entrance. */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Badge */}
        <div
          className="glass-pill inline-flex items-center gap-2 px-4 py-1.5 mb-8"
          style={{ animation: "fadeSlideDown 0.7s ease both" }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--positive)" }}
          />
          <span
            className="text-xs font-medium"
            style={{
              fontFamily: "var(--font-body-family)",
              color: "var(--ink-muted)",
            }}
          >
            Now available — start for free
          </span>
        </div>

        {/* Title */}
        <HeroTitle />

        {/* Subtitle */}
        <p
          className="text-lg max-w-[500px] leading-relaxed mb-10"
          style={{
            fontFamily: "var(--font-body-family)",
            fontWeight: 300,
            color: "var(--ink-muted)",
            animation: "fadeSlideUp 0.8s 0.6s ease both",
          }}
        >
          Studio-quality text-to-speech for creators, developers, and teams. No
          audio engineer required.
        </p>

        {/* CTA Row */}
        <div
          className="flex flex-wrap gap-3.5 justify-center"
          style={{ animation: "fadeSlideUp 0.8s 0.75s ease both" }}
        >
          <button
            onClick={handleStart}
            className="group text-white rounded-xl px-7 py-3.5 text-[15px] font-medium
                       hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,10,10,0.25)]
                       transition-all flex items-center gap-2"
            style={{ background: "var(--ink)" }}
          >
            <span>Start for free</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={handleDemo}
            className="group bg-white/70 border rounded-xl px-7 py-3.5
                       text-[15px] font-medium backdrop-blur-sm
                       hover:bg-white/90 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            style={{
              color: "var(--ink)",
              borderColor: "rgba(10, 10, 10, 0.15)",
            }}
          >
            <Play size={16} className="fill-current opacity-70" />
            <span>Hear a demo</span>
          </button>
        </div>

        {/* Waveform */}
        <div className="mt-8">
          <Waveform />
        </div>

        {/* Dashboard Screenshot — product preview with a soft radial glow
            behind the frame to lift it off the background */}
        <div className="relative w-full max-w-[960px] mx-auto mt-14">
          {/* Glow */}
          <div
            className="absolute inset-5 -bottom-5 rounded-2xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(56,189,248,0.20) 0%, transparent 70%)",
            }}
          />
          {/* Frame */}
          <div
            className="hero-screenshot-frame relative z-10 rounded-2xl overflow-hidden
                       border shadow-[0_40px_100px_rgba(56,189,248,0.14),0_8px_32px_rgba(10,10,10,0.08)]"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <Image
              src="/Dashbord.jpeg"
              alt="Sonic Dashboard"
              width={960}
              height={600}
              priority
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
