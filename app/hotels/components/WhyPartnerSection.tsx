import Link from "next/link";
import { RevealSection } from "./RevealSection";

type Props = {
  headline: string;
  sub: string;
  bullets: readonly string[];
};

export function WhyPartnerSection({ headline, sub, bullets }: Props) {
  return (
    <RevealSection>
      <section className="hw-partner">
        <div className="hw-partner__content">
          <span className="hw-partner__eyebrow">Why partner with Collectiv. Studio</span>
          <h2 className="hw-partner__headline">{headline}</h2>
          <p className="hw-partner__sub">{sub}</p>
          <ul className="hw-partner__list">
            {bullets.map((b) => (
              <li key={b} className="hw-partner__item">
                {b}
              </li>
            ))}
          </ul>
          <Link href="/contactus" className="hw-partner__link">
            Start a conversation →
          </Link>
        </div>
        <aside className="hw-partner__aside">
          <div className="hw-partner__stat">
            <span className="hw-partner__stat-num">3×</span>
            <span className="hw-partner__stat-label">Faster than agency timelines</span>
          </div>
          <div className="hw-partner__stat">
            <span className="hw-partner__stat-num">100%</span>
            <span className="hw-partner__stat-label">Custom — no templates</span>
          </div>
          <div className="hw-partner__stat">
            <span className="hw-partner__stat-num">UK</span>
            <span className="hw-partner__stat-label">Based team, global hotels</span>
          </div>
        </aside>
      </section>
    </RevealSection>
  );
}
