/**
 * -----------------------------------------------------------------------------
 * Root Layout
 * -----------------------------------------------------------------------------
 * The root layout wraps every route in the app (landing, auth, dashboard, and
 * API-adjacent pages). It exists to establish the single HTML document shell,
 * load the global font stack and stylesheet, and mount the app-wide providers:
 * Clerk (authentication), tRPC React (client-side API access), and Nuqs
 * (type-safe URL search-param state). It also defines the default SEO metadata
 * (title template, Open Graph, and Twitter cards) inherited by all pages.
 */
import type { Metadata } from "next";
import { Geist_Mono, Inter, Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// Google fonts are loaded at build time and exposed as CSS variables so they
// can be referenced from Tailwind/theme tokens without layout-shifting FOUT.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
});

// App-wide SEO defaults. `metadataBase` resolves relative OG/Twitter image
// URLs against APP_URL, and the title template prefixes page titles with "| Sonic".
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "Sonic",
    template: "%s | Sonic",
  },
  description: "AI powered text-to-speech and voice cloning Platform",
  keywords: ["Text to Speech", "TTS", "Voice Cloning", "AI Voice", "Speech Synthesis", "Sonic"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Sonic — AI Text-to-Speech & Voice Cloning",
    description: "Studio-quality text-to-speech for creators, developers, and teams. Turn any text into natural speech in seconds.",
    siteName: "Sonic",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Sonic AI Voice Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sonic — AI Text-to-Speech & Voice Cloning",
    description: "Studio-quality text-to-speech for creators, developers, and teams. Turn any text into natural speech in seconds.",
    images: ["/hero-bg.jpg"],
  },
};

/**
 * RootLayout renders the HTML shell and nests the global providers around all
 * pages. Provider order matters: Clerk must wrap everything so auth state is
 * available to tRPC procedures, and TRPCReactProvider wraps the tree so client
 * components can call tRPC hooks. The Toaster sits outside NuqsAdapter so
 * notifications render regardless of URL-param state.
 *
 * @param children - The active route's page content.
 * @returns The root HTML document with providers mounted.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <html lang="en">
          <body
            className={`${inter.variable} ${geistMono.variable} ${bricolage.variable} ${dmSans.variable} antialiased`}
          >
            <NuqsAdapter>
              {children}
            </NuqsAdapter>
            <Toaster />
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
