import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Space_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { MARKETING_SITE_URL } from "@/lib/marketing-seo";
import "./fallback-layout.css";
import "./globals.css";

/** Display: Instrument Serif. Body mono: Space Mono (Google Fonts pairing; `next/font` preloads WOFF2 in the document head). */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(MARKETING_SITE_URL),
  title: "Collectiv. Studio - Brand, Web & Social Media Agency | Bristol",
  description:
    "Collectiv. Studio is a boutique creative agency offering brand strategy, website design and social media management. Based in Bristol, working with businesses across the UK.",
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "48x48" }],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    shortcut: "/icon",
  },
  openGraph: {
    siteName: "Collectiv. Studio",
    locale: "en_GB",
    type: "website",
  },
};

/** Edge-to-edge on notched iPhones so safe-area + header chrome sit over the hero, not body cream. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Dev-only: if `/_next/static` CSS fails (stale .next, wrong port, preview race), stay readable. :where() = 0 specificity so Tailwind always wins when loaded. */
const DEV_STYLE_FALLBACK = `:where(body){margin:0;background:#f2edeb;color:#250d18}:where(a){color:#250d18}:where(svg[aria-hidden="true"][viewBox="0 0 24 24"]){width:1.25rem;height:1.25rem;display:block;flex-shrink:0}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${spaceMono.variable}`}>
      <body className="min-h-dvh bg-cream text-burgundy antialiased">
        {process.env.NODE_ENV === "development" ? (
          <style dangerouslySetInnerHTML={{ __html: DEV_STYLE_FALLBACK }} />
        ) : null}
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
