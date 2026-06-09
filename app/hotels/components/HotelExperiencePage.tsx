import type { HotelTheme } from "../data";
import { CITY_ROOMS, COTSWOLDS_ROOMS, MEDITERRANEAN_ROOMS } from "../data";
import { EXPERIENCE_CONTENT } from "../selling-content";
import { AmenityRow } from "./AmenityRow";
import { ExperienceHighlights } from "./ExperienceHighlights";
import { HeroWithBooking } from "./HeroWithBooking";
import { HotelEnquiryCta } from "./HotelEnquiryCta";
import { HotelExperienceShell } from "./HotelExperienceShell";
import { HotelNav } from "./HotelNav";
import { IntegrationShowcase } from "./IntegrationShowcase";
import { IntroSection } from "./IntroSection";
import { ParallaxInterlude } from "./ParallaxInterlude";
import { ExperienceFooter, RoomShowcase } from "./RoomShowcase";
import { ReviewsStrip } from "./ReviewsStrip";
import { WhyPartnerSection } from "./WhyPartnerSection";

const ROOMS: Record<HotelTheme, typeof MEDITERRANEAN_ROOMS> = {
  mediterranean: MEDITERRANEAN_ROOMS,
  cotswolds: COTSWOLDS_ROOMS,
  city: CITY_ROOMS,
};

type Props = {
  theme: HotelTheme;
};

export function HotelExperiencePage({ theme }: Props) {
  const c = EXPERIENCE_CONTENT[theme];

  return (
    <HotelExperienceShell theme={theme}>
      <HotelNav title={c.navTitle} />
      <HeroWithBooking
        theme={theme}
        imageSrc={c.heroImage}
        layout={c.heroLayout}
        bookingProperty={c.bookingProperty}
        bookingFrom={c.bookingFrom}
      >
        <p className="hw-hero__eyebrow">{c.heroEyebrow}</p>
        <h1 className="hw-hero__headline">{c.heroHeadline}</h1>
        <p className="hw-hero__sub">{c.heroSub}</p>
      </HeroWithBooking>

      <IntroSection
        introType={c.introType}
        introQuote={c.introQuote}
        introEditorialText={c.introEditorialText}
        introEditorialImage={c.introEditorialImage}
        introStatement={c.introStatement}
      />

      <RoomShowcase heading={c.roomsHeading} rooms={ROOMS[theme]} />

      <IntegrationShowcase
        eyebrow={c.integrationsEyebrow}
        headline={c.integrationsHeadline}
        items={c.integrations}
      />

      <ExperienceHighlights items={c.highlights} />

      <AmenityRow items={c.amenities} />

      <ParallaxInterlude imageSrc={c.interludeImage} />

      <ReviewsStrip reviews={c.reviews} />

      <WhyPartnerSection headline={c.partnerHeadline} sub={c.partnerSub} bullets={c.partnerBullets} />

      <HotelEnquiryCta headline={c.ctaHeadline} sub={c.ctaSub} />

      <ExperienceFooter />
    </HotelExperienceShell>
  );
}
