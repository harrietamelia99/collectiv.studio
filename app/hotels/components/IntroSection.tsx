import Image from "next/image";
import type { ExperienceContent } from "../selling-content";
import { RevealSection } from "./RevealSection";

type Props = Pick<
  ExperienceContent,
  "introType" | "introQuote" | "introEditorialText" | "introEditorialImage" | "introStatement"
>;

export function IntroSection({
  introType,
  introQuote,
  introEditorialText,
  introEditorialImage,
  introStatement,
}: Props) {
  return (
    <RevealSection>
      <section className={`hw-section hw-intro hw-intro--${introType}`}>
        {introType === "quote" && introQuote ? (
          <>
            <blockquote className="hw-quote hw-quote--med">&ldquo;{introQuote}&rdquo;</blockquote>
            <div className="hw-rule" />
            <span className="hw-label">The Mediterranean experience</span>
          </>
        ) : null}

        {introType === "editorial" && introEditorialText && introEditorialImage ? (
          <div className="hw-editorial">
            <p className="hw-editorial__text">{introEditorialText}</p>
            <div className="hw-editorial__image">
              <Image
                src={introEditorialImage}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 40vw"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}

        {introType === "statement" && introStatement ? (
          <>
            <p className="hw-statement">&ldquo;{introStatement}&rdquo;</p>
            <div className="hw-statement-rule" />
          </>
        ) : null}
      </section>
    </RevealSection>
  );
}
