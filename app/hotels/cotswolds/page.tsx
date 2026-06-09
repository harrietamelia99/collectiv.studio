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
import { COTSWOLDS_ROOMS } from "../data";

export const metadata: Metadata = {
  title: "The Great Escape — Cotswolds Hotel Experience | Collectiv. Studio",
  description: "A countryside boutique hotel microsite demo by Collectiv. Studio.",
  robots: { index: false, follow: false },
};

export default function CotswoldsHotelPage() {
  return (
    <HotelExperienceShell theme="cotswolds">
      <HotelNav title="The Great Escape" />
      <ParallaxHero imageSrc="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&q=85">
        <p className="hw-hero__eyebrow">THE COTSWOLDS · LAKE DISTRICT · CORNWALL</p>
        <h1 className="hw-hero__headline">Far from the noise</h1>
        <p className="hw-hero__sub">Country house hotels that feel like coming home</p>
      </ParallaxHero>

      <RevealSection>
        <section className="hw-section" style={{ background: "var(--hw-bg)" }}>
          <div className="hw-editorial">
            <p className="hw-editorial__text">
              There are places in England where time moves differently. Where log fires replace phone
              signals, where the view from the window is the only entertainment you need.
            </p>
            <div className="hw-editorial__image">
              <Image
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80"
                alt="Rolling countryside hills"
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 40vw"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <RoomShowcase rooms={COTSWOLDS_ROOMS} />

      <AmenityRow
        items={[
          { key: "fire", label: "Open Fires" },
          { key: "dining", label: "Country Dining" },
          { key: "grounds", label: "Estate Grounds" },
          { key: "spa", label: "Spa & Pool" },
          { key: "dog", label: "Dog Friendly" },
          { key: "tea", label: "Afternoon Tea" },
        ]}
      />

      <ParallaxInterlude imageSrc="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1800&q=80" />

      <HotelEnquiryCta
        headline="Your hotel, beautifully told online."
        sub="Collectiv. Studio creates custom hotel websites that convert browsers into guests."
      />

      <ExperienceFooter />
    </HotelExperienceShell>
  );
}
