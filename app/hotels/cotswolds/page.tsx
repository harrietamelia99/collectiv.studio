import type { Metadata } from "next";
import { HotelExperiencePage } from "../components/HotelExperiencePage";

export const metadata: Metadata = {
  title: "The Great Escape — Cotswolds Hotel Experience | Collectiv. Studio",
  description: "A countryside boutique hotel microsite demo by Collectiv. Studio.",
  robots: { index: false, follow: false },
};

export default function CotswoldsHotelPage() {
  return <HotelExperiencePage theme="cotswolds" />;
}
