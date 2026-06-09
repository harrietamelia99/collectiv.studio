import Link from "next/link";
import { RevealSection } from "./RevealSection";

type Props = {
  headline: string;
  sub?: string;
};

export function HotelEnquiryCta({ headline, sub }: Props) {
  return (
    <RevealSection>
      <section className="hw-cta">
        <p className="hw-cta__eyebrow">Interested in a hotel website like this?</p>
        <h2 className="hw-cta__headline">{headline}</h2>
        {sub ? <p className="hw-cta__sub">{sub}</p> : null}
        <Link href="/contactus" className="hw-cta__btn">
          Get in touch
        </Link>
      </section>
    </RevealSection>
  );
}
