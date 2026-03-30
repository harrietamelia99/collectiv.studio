"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle: string;
  imageSrc: string;
  href: string;
  index: number;
  /** Passed to `object-position` so mockups (e.g. laptops) can sit visually centred in the crop. */
  imageObjectPosition?: string;
};

export function PortfolioCard({
  title,
  subtitle,
  imageSrc,
  href,
  index,
  imageObjectPosition,
}: Props) {
  const n = String(index).padStart(2, "0");

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="h-full"
    >
      <Link href={href} className="group flex h-full flex-col">
        <div
          className="relative w-full shrink-0 overflow-hidden bg-burgundy shadow-[0_4px_24px_rgba(37,13,24,0.08)] ring-1 ring-burgundy/10 transition-shadow duration-500 group-hover:shadow-[var(--cc-pill-shadow)] group-hover:ring-burgundy/25 aspect-[5/4] sm:aspect-[4/3]"
        >
          <Image
            src={imageSrc}
            alt={`${title} - case study preview`}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            style={
              imageObjectPosition ? { objectPosition: imageObjectPosition } : undefined
            }
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          />

          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-burgundy/65 via-burgundy/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

          <span className="absolute left-3 top-3 z-[2] rounded-[var(--cc-pill-radius)] border border-burgundy/22 bg-cream/95 px-2 py-0.5 font-body text-[9px] font-normal tabular-nums tracking-[0.18em] text-burgundy shadow-[0_1px_10px_rgba(37,13,24,0.12)] sm:left-4 sm:top-4 sm:px-2.5 sm:py-1 sm:text-[10px] md:left-5 md:top-5">
            {n}
          </span>

          <span className="cc-caption-strong absolute right-3 top-3 z-[2] max-w-[min(100%,11rem)] truncate rounded-[var(--cc-pill-radius)] border border-burgundy/22 bg-cream/95 px-2 py-0.5 shadow-[0_1px_10px_rgba(37,13,24,0.12)] sm:right-4 sm:top-4 sm:max-w-[13rem] sm:px-2.5 sm:py-1 md:right-5 md:top-5">
            {subtitle}
          </span>

          <div className="absolute inset-x-0 bottom-0 z-[2] flex translate-y-2 flex-col items-start gap-1.5 p-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:gap-2 sm:p-4 md:p-5">
            <span className="font-display text-cc-h4 font-normal leading-tight text-cream sm:text-[clamp(1.05rem,2.5vw,1.35rem)]">
              {title}
            </span>
            <span className="cc-caption-light flex items-center gap-2">
              View case study
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-1 flex-col justify-end gap-2 border-b-cc border-solid border-[var(--cc-border)] pb-3 transition-colors duration-300 group-hover:border-burgundy/25 sm:mt-4 sm:pb-3.5">
          <div className="min-w-0">
            <p className="font-display text-[clamp(1rem,2.2vw,1.2rem)] font-normal leading-snug tracking-[-0.02em] text-burgundy">
              {title}
            </p>
            <p className="cc-caption mt-1 line-clamp-2 text-burgundy/65">{subtitle}</p>
          </div>
          <span className="cc-caption-strong text-burgundy underline decoration-burgundy/30 underline-offset-[0.2em] transition-all group-hover:decoration-burgundy">
            View case study
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
