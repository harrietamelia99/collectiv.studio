import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "../../styles/hotels.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-hotel-display",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-hotel-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hotel & Hospitality Web Design | Collectiv. Studio",
  description:
    "Luxury hotel websites that drive direct bookings. Collectiv. Studio builds bespoke digital experiences for boutique hotels across the UK and Mediterranean.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function HotelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cormorant.variable} ${jost.variable} hotel-world`}>{children}</div>
  );
}
