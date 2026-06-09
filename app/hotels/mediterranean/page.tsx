import type { Metadata } from "next";
import Image from "next/image";
import { AmenityRow } from "../components/AmenityRow";
import { HotelEnquiryCta } from "../components/HotelEnquiryCta";
import { HotelExperienceShell } from "../components/HotelExperienceShell";
import { HotelNav } from "../components/HotelNav";
import { ParallaxHero } from "../components/ParallaxHero";
import { ParallaxInterlude } from "../components/ParallaxInterlude";
import { ExperienceFooter, RoomShowcase } from "../components/RoomShowcase";
import { RevealSection } from "../components/RevealSection";
import { MEDITERRANEAN_ROOMS } from "../data";

export const metadata: Metadata = {
  title: "Sun, Sea & Stone — Mediterranean Hotel Experience | Collectiv. Studio",
  description: "A boutique Mediterranean hotel microsite demo by Collectiv. Studio.",
  robots: { index: false, follow: false },
};

export default function MediterraneanHotelPage() {
  return (
    <HotelExperienceShell theme="mediterranean">
      <HotelNav title="Sun, Sea & Stone" />
      <ParallaxHero imageSrc="https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1800&q=85">
        <p className="hw-hero__eyebrow">MYKONOS · MARBELLA · CÔTE D&apos;AZUR</p>
        <h1 className="hw-hero__headline">Where the sun sets slowly</h1>
        <p className="hw-hero__sub">Boutique hotels that feel like a secret</p>
      </ParallaxHero>

      <RevealSection>
        <section className="hw-section" style={{ background: "var(--hw-bg)" }}>
          <blockquote className="hw-quote">
            &ldquo;Some places don&apos;t just welcome you. They change you.&rdquo;
          </blockquote>
          <div className="hw-rule" />
          <span className="hw-label">The Experience</span>
        </section>
      </RevealSection>

      <RoomShowcase rooms={MEDITERRANEAN_ROOMS} />

      <AmenityRow
        items={[
          { key: "pool", label: "Infinity Pool" },
          { key: "dining", label: "Private Dining" },
          { key: "sun", label: "Sunset Terrace" },
          { key: "spa", label: "Spa & Hammam" },
          { key: "concierge", label: "24hr Concierge" },
          { key: "transport", label: "Airport Transfer" },
        ]}
      />

      <ParallaxInterlude imageSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800&q=80" />

      <HotelEnquiryCta
        headline="Let's build your hotel's digital presence."
        sub="Collectiv. Studio creates custom hotel websites that convert browsers into guests."
      />

      <ExperienceFooter />
    </HotelExperienceShell>
  );
}
