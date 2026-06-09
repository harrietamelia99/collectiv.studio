import type { Metadata } from "next";
import { AmenityRow } from "../components/AmenityRow";
import { HotelEnquiryCta } from "../components/HotelEnquiryCta";
import { HotelExperienceShell } from "../components/HotelExperienceShell";
import { HotelNav } from "../components/HotelNav";
import { ParallaxHero } from "../components/ParallaxHero";
import { ParallaxInterlude } from "../components/ParallaxInterlude";
import { ExperienceFooter, RoomShowcase } from "../components/RoomShowcase";
import { RevealSection } from "../components/RevealSection";
import { CITY_ROOMS } from "../data";

export const metadata: Metadata = {
  title: "The Urban Edit — City Hotel Experience | Collectiv. Studio",
  description: "A modern city hotel microsite demo by Collectiv. Studio.",
  robots: { index: false, follow: false },
};

export default function CityHotelPage() {
  return (
    <HotelExperienceShell theme="city">
      <HotelNav title="The Urban Edit" />
      <ParallaxHero imageSrc="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1800&q=85">
        <p className="hw-hero__eyebrow">LONDON · PARIS · AMSTERDAM</p>
        <h1 className="hw-hero__headline">The city, refined.</h1>
        <p className="hw-hero__sub">Modern hotels for people who know what they want</p>
      </ParallaxHero>

      <RevealSection>
        <section className="hw-section" style={{ background: "var(--hw-bg)", paddingTop: 160, paddingBottom: 160 }}>
          <p className="hw-statement">&ldquo;Not a room. A position.&rdquo;</p>
          <div className="hw-statement-rule" />
        </section>
      </RevealSection>

      <RoomShowcase rooms={CITY_ROOMS} />

      <AmenityRow
        items={[
          { key: "bar", label: "Rooftop Bar" },
          { key: "cinema", label: "Private Cinema" },
          { key: "lounge", label: "Members Lounge" },
          { key: "dining", label: "In-Room Dining" },
          { key: "valet", label: "Valet Parking" },
          { key: "shop", label: "Personal Shopper" },
        ]}
      />

      <ParallaxInterlude imageSrc="https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=1800&q=80" />

      <HotelEnquiryCta
        headline="A hotel website that works as hard as the city."
        sub="Collectiv. Studio creates custom hotel websites that convert browsers into guests."
      />

      <ExperienceFooter />
    </HotelExperienceShell>
  );
}
