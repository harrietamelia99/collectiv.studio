import { RevealSection } from "./RevealSection";

type Review = { quote: string; source: string };

type Props = {
  reviews: readonly Review[];
};

export function ReviewsStrip({ reviews }: Props) {
  return (
    <RevealSection>
      <section className="hw-reviews">
        <span className="hw-reviews__eyebrow">Social proof, on-brand</span>
        <div className="hw-reviews__grid">
          {reviews.map((r) => (
            <blockquote key={r.source} className="hw-review">
              <p className="hw-review__quote">&ldquo;{r.quote}&rdquo;</p>
              <footer className="hw-review__source">— {r.source}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </RevealSection>
  );
}
