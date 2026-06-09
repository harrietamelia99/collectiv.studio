import type { Metadata } from "next";
import { HotelExperiencePage } from "../components/HotelExperiencePage";

export const metadata: Metadata = {
  title: "The Urban Edit — City Hotel Experience | Collectiv. Studio",
  description: "A modern city hotel microsite demo by Collectiv. Studio.",
  robots: { index: false, follow: false },
};

export default function CityHotelPage() {
  return <HotelExperiencePage theme="city" />;
}
