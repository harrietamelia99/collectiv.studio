import type { Metadata } from "next";
import { HotelExperiencePage } from "../components/HotelExperiencePage";

export const metadata: Metadata = {
  title: "Sun, Sea & Stone — Mediterranean Hotel Experience | Collectiv. Studio",
  description: "A boutique Mediterranean hotel microsite demo by Collectiv. Studio.",
  robots: { index: false, follow: false },
};

export default function MediterraneanHotelPage() {
  return <HotelExperiencePage theme="mediterranean" />;
}
