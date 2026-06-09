import Image from "next/image";
import type { HighlightBlock } from "../selling-content";
import { RevealSection } from "./RevealSection";

type Props = {
  items: HighlightBlock[];
};

export function ExperienceHighlights({ items }: Props) {
  return (
    <RevealSection>
      <section className="hw-highlights">
        <span className="hw-highlights__eyebrow">Beyond the room</span>
        <h2 className="hw-highlights__headline">Experiences that drive revenue</h2>
        <div className="hw-highlights__list">
          {items.map((item, i) => (
            <article
              key={item.title}
              className={`hw-highlight ${i % 2 === 1 ? "hw-highlight--reverse" : ""}`}
            >
              <div className="hw-highlight__image">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div className="hw-highlight__body">
                <span className="hw-highlight__label">{item.label}</span>
                <h3 className="hw-highlight__title">{item.title}</h3>
                <p className="hw-highlight__text">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </RevealSection>
  );
}
