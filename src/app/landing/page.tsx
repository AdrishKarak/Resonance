/**
 * -----------------------------------------------------------------------------
 * Landing / Marketing Page
 * -----------------------------------------------------------------------------
 * The public marketing page at `/landing` — the primary SEO entry point for
 * the product. It composes the marketing sections (navbar, hero, logo marquee,
 * interactive TTS demo, feature bento grid, pricing, footer) from
 * `@/components/landing/*`. It exists to convert visitors into sign-ups by
 * linking to `/sign-up` and `/sign-in`, and it is the only page explicitly
 * allowed in `robots.ts` and listed with top priority in `sitemap.ts`.
 */
import type { Metadata } from "next";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Marquee from "@/components/landing/marquee";
import TtsSection from "@/components/landing/tts-section";
import BentoGrid from "@/components/landing/bento-grid";
import Pricing from "@/components/landing/pricing";
import Footer from "@/components/landing/footer";

// Page-level metadata overrides the root layout defaults so search results
// and social shares show marketing copy specific to this page.
export const metadata: Metadata = {
  title: "Sonic — AI Text-to-Speech & Voice Cloning",
  description:
    "Studio-quality text-to-speech for creators, developers, and teams. Turn any text into natural speech in seconds.",
  openGraph: {
    title: "Sonic — AI Text-to-Speech & Voice Cloning",
    description: "Studio-quality text-to-speech for creators, developers, and teams. Turn any text into natural speech in seconds.",
    url: "/landing",
  }
};

/**
 * LandingPage renders the full marketing page by stacking each section
 * component. It is a server component with no data fetching — all sections
 * are static and the interactive TTS demo handles its own client state.
 *
 * @returns The complete landing page, one section after another.
 */
export default function LandingPage() {
  // The sky-canvas CSS variable provides the page's signature gradient
  // background defined in globals.css.
  return (
    <div style={{ background: "var(--sky-canvas)" }}>
      <Navbar />
      <Hero />
      <Marquee />
      <TtsSection />
      <BentoGrid />
      <Pricing />
      <Footer />
    </div>
  );
}
