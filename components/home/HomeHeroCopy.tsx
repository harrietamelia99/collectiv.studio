"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";

type HeroSlide = {
  id: string;
  tag: string;
  title: ReactNode;
  /** Omitted when the slide has no supporting line under the headline (rendered below the H1). */
  sub?: ReactNode;
  cta: { label: string; href: "/portfolio" | "/about" };
};

const ROTATE_MS = 6500;
const FADE_S = 0.42;

const heroCtaClass = `cc-hero-cta w-full max-w-[17.5rem] sm:max-w-none lg:w-auto lg:max-w-fit ${ctaButtonClasses({
  variant: "cream",
  size: "hero",
  className:
    "max-lg:!min-h-[2.75rem] max-lg:!w-full max-lg:!max-w-[17.5rem] max-lg:!px-6 max-lg:!py-3 max-lg:!text-[9px] max-lg:!tracking-[0.12em] lg:!min-h-[2.75rem] lg:!min-w-0 lg:!px-7 lg:!py-3 lg:!text-[10px] lg:!tracking-[0.12em]",
})}`;

const slides: HeroSlide[] = [
  {
    id: "about",
    tag: "[ WHO WE ARE · WHAT WE DO ]",
    title: (
      <>
        Collectiv. is an independent creative studio.{" "}
        <span className="font-normal italic">Websites, branding, social</span>
        , and the thinking that ties it together.
      </>
    ),
    cta: { label: "About the studio", href: "/about" },
  },
  {
    id: "intro",
    tag: "[ 360° BRAND AGENCY ]",
    title: (
      <>
        Strategy sets the direction.
        <br />
        <span className="font-normal italic">Creativity sets the standard.</span>
      </>
    ),
    sub: "your business is evolving, now your brand needs to play catch up.",
    cta: { label: "Explore our work", href: "/portfolio" },
  },
];

export function HomeHeroCopy() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;
    const id = window.setInterval(advance, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [advance, reduceMotion]);

  const active = reduceMotion ? 0 : index;

  return (
    <div
      role="region"
      className="cc-hero-stack flex w-full max-w-[min(100%,36rem)] flex-col items-center gap-4 sm:max-w-[min(100%,38rem)] md:max-w-[min(100%,44rem)] md:gap-6 lg:max-w-[48rem] lg:gap-8"
      aria-label="Hero introduction"
    >
      <div className="grid w-full [&>*]:col-start-1 [&>*]:row-start-1">
        {slides.map((slide, i) => {
          const isOn = i === active;
          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{
                opacity: isOn ? 1 : 0,
              }}
              transition={{
                duration: reduceMotion ? 0 : FADE_S,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={
                isOn
                  ? "flex w-full flex-col items-center gap-4 md:gap-6 lg:gap-8"
                  : "pointer-events-none flex w-full flex-col items-center gap-4 md:gap-6 lg:gap-8"
              }
              aria-hidden={!isOn}
            >
              <p className="cc-hero-tag font-body text-[9px] font-normal uppercase leading-none tracking-[0.09em] text-white/88 sm:text-[10px] md:text-[11px] md:tracking-[0.09em]">
                {slide.tag}
              </p>
              <h1 className="cc-no-heading-hover w-full max-w-full text-[clamp(1.65rem,6.9vw,2.55rem)] font-normal leading-[1.02] tracking-[-0.04em] text-white sm:max-w-[min(100%,34rem)] sm:text-[clamp(1.85rem,5.8vw,3.2rem)] sm:leading-[0.99] sm:tracking-[-0.045em] md:max-w-[min(100%,42rem)] md:text-[clamp(2.35rem,5.2vw,4.2rem)] md:leading-[0.96] md:tracking-[-0.052em] lg:max-w-[min(100%,46rem)] lg:text-[clamp(2.5rem,4.6vw,4.65rem)] lg:leading-[0.95] lg:tracking-[-0.056em]">
                {slide.title}
              </h1>
              {slide.sub != null ? (
                <p className="cc-hero-sub mx-auto max-w-[min(32ch,100%)] text-pretty font-body text-[12px] font-normal lowercase leading-[1.65] tracking-[0.01em] text-white/90 sm:max-w-[min(36ch,100%)] sm:text-[12.5px] sm:leading-[1.68] md:max-w-[min(38ch,100%)] md:text-[13px] md:leading-[1.7]">
                  {slide.sub}
                </p>
              ) : null}
              <div className="flex w-full max-w-lg flex-col items-center gap-5 sm:max-w-xl sm:gap-7 md:gap-10">
                <Link
                  href={slide.cta.href}
                  className={heroCtaClass}
                  tabIndex={isOn ? undefined : -1}
                >
                  {slide.cta.label}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
      {!reduceMotion && slides.length > 1 ? (
        <div
          className="flex justify-center gap-2 pt-1"
          role="tablist"
          aria-label="Hero slides"
        >
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show slide ${i + 1}: ${slide.tag}`}
              onClick={() => setIndex(i)}
              className={
                i === active
                  ? "h-1.5 w-1.5 rounded-full bg-white transition-transform duration-200"
                  : "h-1.5 w-1.5 rounded-full bg-white/35 transition-colors hover:bg-white/55"
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
