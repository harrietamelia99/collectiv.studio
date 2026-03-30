"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PREVIEW_MAX = 200;

function StarRow() {
  return (
    <div
      className="mb-5 flex justify-center gap-1.5 md:mb-10 md:gap-2"
      role="img"
      aria-label="5 out of 5 stars"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 text-cream/88 md:h-6 md:w-6"
          aria-hidden
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
        </svg>
      ))}
    </div>
  );
}

const staticQuotes: { text: string; name: string; id?: string; fullHref?: string }[] = [
  {
    text: "Working with Collectiv. over the last 12 months has honestly been one of the best decisions we've made for Tan-Ex.",
    name: "Tan-Ex Salon",
  },
  {
    text: "We decided to bring Harriet on to run our socials and improve our overall engagement. Our turnover up 150%, a coincidence? We don't think so!",
    name: "PROSITEUK",
  },
  {
    text: "We just wanted to say a massive thank you - you have exceeded our expectations with this website and we are so pleased with the outcome!",
    name: "Petite Social Club",
  },
  {
    text: "Thank you so so much for building me the website of dreams! I'm obsessed! You are the best.",
    name: "Peaches Nutrition",
  },
];

export type DbTestimonial = { id: string; text: string; name: string };

type Props = {
  /** Five-star client reviews approved for the homepage (after offboarding). */
  dbQuotes?: DbTestimonial[];
};

export function TestimonialCarousel({ dbQuotes = [] }: Props) {
  const quotes = useMemo(() => {
    const fromDb = dbQuotes.map((q) => ({
      text: q.text,
      name: q.name,
      id: q.id,
      fullHref: q.text.length > PREVIEW_MAX ? `/reviews/${q.id}` : undefined,
    }));
    return [...fromDb, ...staticQuotes];
  }, [dbQuotes]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (quotes.length === 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % quotes.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [quotes.length]);

  useEffect(() => {
    setIndex(0);
  }, [quotes.length]);

  const q = quotes[index] ?? staticQuotes[0];
  const displayText =
    q.fullHref && q.text.length > PREVIEW_MAX ? `${q.text.slice(0, PREVIEW_MAX).trim()}…` : q.text;

  return (
    <div className="mx-auto w-full max-w-3xl text-center">
      <StarRow />
      <div
        className="relative min-h-[8.5rem] sm:min-h-[10rem] md:min-h-[11rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Plain CSS fade - Framer initial opacity:0 on keyed remounts was leaving slides invisible in production/Strict Mode. */}
        <div
          key={index}
          className="cc-testimonial-slide relative origin-center text-cream"
        >
          <blockquote className="cc-no-heading-hover font-display text-cc-h3 font-normal italic text-cream md:text-cc-h2">
            &ldquo;{displayText}&rdquo;
          </blockquote>
          <cite className="cc-copy-inverse mt-4 block not-italic text-cream/70 md:mt-6">{q.name}</cite>
          {q.fullHref ? (
            <Link
              href={q.fullHref}
              className="mt-3 inline-block font-body text-[11px] uppercase tracking-[0.12em] text-cream/80 underline-offset-4 transition-colors hover:text-cream hover:underline"
            >
              Read full review
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
