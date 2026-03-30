import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function FullReviewPage({ params }: Props) {
  const review = await prisma.publishedClientReview.findUnique({
    where: { id: params.id },
    select: {
      reviewerName: true,
      reviewText: true,
      rating: true,
      featuredOnHome: true,
    },
  });

  if (!review) notFound();

  return (
    <section className="cc-container mx-auto max-w-2xl px-6 py-16 md:py-24">
      <Link
        href="/"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Home
      </Link>
      <p className="mt-10 font-body text-[10px] uppercase tracking-[0.14em] text-burgundy/50">Client review</p>
      <h1 className="mt-2 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">{review.reviewerName}</h1>
      <div className="mt-4 flex items-center gap-1" role="img" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${i < review.rating ? "text-burgundy" : "text-burgundy/20"}`}
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
          </svg>
        ))}
      </div>
      <blockquote className="mt-10 border-l-2 border-burgundy/25 pl-6 font-body text-lg leading-relaxed text-burgundy/90 md:text-xl">
        &ldquo;{review.reviewText}&rdquo;
      </blockquote>
      {review.featuredOnHome ? (
        <p className="mt-10 font-body text-sm text-burgundy/55">
          Thank you for sharing this publicly — it may appear on our homepage alongside other five-star feedback.
        </p>
      ) : null}
    </section>
  );
}
