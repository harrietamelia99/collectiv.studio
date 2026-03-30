"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PortfolioProject } from "@/lib/portfolio";
import { portfolioProjects } from "@/lib/portfolio";

const ROTATE_MS = 6000;

function FeaturedProjectCard({
  project,
  positionLabel,
  priority,
}: {
  project: PortfolioProject;
  positionLabel: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group flex h-full min-h-0 flex-col overflow-hidden border-cc border-solid border-[var(--cc-hairline)] bg-cream text-left transition-[transform,border-color,box-shadow] duration-300 ease-smooth hover:-translate-y-1 hover:border-burgundy/25 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-burgundy/8">
        <Image
          src={project.image}
          alt=""
          fill
          className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.05]"
          style={
            project.imageObjectPosition
              ? { objectPosition: project.imageObjectPosition }
              : undefined
          }
          sizes="(max-width: 1023px) 100vw, (max-width:1536px) 45vw, 40rem"
          priority={priority}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-burgundy/25 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
        <span className="absolute left-4 top-4 z-[1] rounded-[var(--cc-pill-radius)] border border-burgundy/22 bg-cream/95 px-2.5 py-1 font-body text-[9px] font-normal tabular-nums tracking-[0.18em] text-burgundy shadow-[0_1px_10px_rgba(37,13,24,0.12)] md:left-5 md:top-5 md:text-[10px]">
          {positionLabel}
        </span>
        <span className="cc-caption-strong absolute right-4 top-4 z-[1] max-w-[min(100%,10rem)] truncate rounded-[var(--cc-pill-radius)] border border-burgundy/22 bg-cream/95 px-2.5 py-1 text-[9px] shadow-[0_1px_10px_rgba(37,13,24,0.12)] md:right-5 md:top-5 md:max-w-[min(100%,12rem)] md:text-[10px]">
          {project.type}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 md:px-5 md:py-5 lg:px-5 lg:py-5">
        <h3 className="cc-no-heading-hover font-display text-cc-h4 font-normal tracking-[-0.02em] text-burgundy lg:text-[clamp(1.15rem,1.8vw,1.45rem)] lg:leading-snug xl:text-cc-h3">
          {project.title}
        </h3>
        <p className="cc-caption-strong mt-1.5 normal-case text-burgundy/65 md:mt-2">
          {project.type} · {project.year}
        </p>
        <p className="cc-copy-muted mt-2 line-clamp-2 text-[11px] leading-relaxed md:mt-3 md:text-[12px] lg:line-clamp-3">
          {project.tagline}
        </p>
        <span className="cc-caption-strong mt-auto inline-block pt-4 text-burgundy underline decoration-burgundy/30 underline-offset-[0.25em] transition-colors group-hover:decoration-burgundy md:pt-5">
          View case study →
        </span>
      </div>
    </Link>
  );
}

export function HomeFeaturedProjectRotator() {
  const projects = portfolioProjects;
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (i: number) => {
      setIndex(((i % projects.length) + projects.length) % projects.length);
    },
    [projects.length],
  );

  useEffect(() => {
    if (projects.length <= 1 || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % projects.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [projects.length, reduceMotion]);

  const left = projects[index];
  const right = projects[(index + 1) % projects.length];
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

  const leftLabel = String(index + 1).padStart(2, "0");
  const rightLabel = String(((index + 1) % projects.length) + 1).padStart(2, "0");

  return (
    <div className="mx-auto max-w-4xl lg:max-w-6xl">
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-8">
        <div className="relative flex min-h-0 h-full flex-col overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={left.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={transition}
              aria-roledescription="carousel"
              className="flex h-full min-h-0 w-full flex-col"
            >
              <FeaturedProjectCard
                project={left}
                positionLabel={leftLabel}
                priority={index === 0}
              />
            </motion.article>
          </AnimatePresence>
        </div>

        {projects.length > 1 ? (
          <div className="relative hidden min-h-0 h-full flex-col overflow-hidden lg:flex">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={right.slug}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={transition}
                className="flex h-full min-h-0 w-full flex-col"
              >
                <FeaturedProjectCard project={right} positionLabel={rightLabel} />
              </motion.article>
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      {projects.length > 1 ? (
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Featured projects"
        >
          {projects.map((proj, i) => (
            <button
              key={proj.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${proj.title}`}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-[width,background-color] duration-300 ease-smooth ${
                i === index ? "w-8 bg-burgundy" : "w-2 bg-burgundy/22 hover:bg-burgundy/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
