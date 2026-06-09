import type { IntegrationItem } from "../selling-content";
import { RevealSection } from "./RevealSection";

type Props = {
  eyebrow: string;
  headline: string;
  items: IntegrationItem[];
};

export function IntegrationShowcase({ eyebrow, headline, items }: Props) {
  return (
    <RevealSection>
      <section className="hw-integrations">
        <header className="hw-integrations__header">
          <span className="hw-integrations__eyebrow">{eyebrow}</span>
          <h2 className="hw-integrations__headline">{headline}</h2>
        </header>
        <div className="hw-integrations__grid">
          {items.map((item) => (
            <article key={item.title} className="hw-integration-card">
              <div className="hw-integration-card__top">
                <span className="hw-integration-card__tag">{item.tag}</span>
                <span className="hw-integration-card__chip">{item.chip}</span>
              </div>
              <h3 className="hw-integration-card__title">{item.title}</h3>
              <p className="hw-integration-card__desc">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </RevealSection>
  );
}
