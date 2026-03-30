"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ServicePackageCard,
  ServicePackageCardGroup,
} from "@/components/services/ServicePackageCard";
import type { ServicePackageBlock } from "@/components/services/service-package-block";

/** md+: two cards per step (as requested). Below md: one full-width card for readable mobile layout. */
function useCardsPerView() {
  const [n, setN] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setN(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return n;
}

function CarouselArrow({
  direction,
  onClick,
  disabled,
  label,
  className = "",
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
  label: string;
  className?: string;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-disabled={disabled}
      className={`cc-no-lift inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/35 text-cream transition-[border-color,background-color,opacity] duration-200 ease-smooth hover:border-cream/55 hover:bg-cream/[0.08] disabled:pointer-events-none disabled:opacity-35 md:h-11 md:w-11 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden
      >
        <path
          d={isPrev ? "M15 6l-6 6 6 6" : "M9 6l6 6 -6 6"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function ServicePackagesCarousel({ packages }: { packages: ServicePackageBlock[] }) {
  const cardsPerView = useCardsPerView();
  const totalPages = Math.max(1, Math.ceil(packages.length / cardsPerView));
  const [page, setPage] = useState(0);

  const clampPage = useCallback(
    (p: number) => Math.max(0, Math.min(p, totalPages - 1)),
    [totalPages],
  );

  useEffect(() => {
    setPage((p) => clampPage(p));
  }, [clampPage, packages.length, cardsPerView]);

  const safePage = clampPage(page);
  const start = safePage * cardsPerView;
  const visible = packages.slice(start, start + cardsPerView);
  const loneLastDesktop = visible.length === 1 && cardsPerView === 2;

  const goPrev = () => setPage((p) => clampPage(p - 1));
  const goNext = () => setPage((p) => clampPage(p + 1));

  const canPrev = safePage > 0;
  const canNext = safePage < totalPages - 1;

  return (
    <div
      className="mx-auto w-full max-w-5xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Service packages"
    >
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-5">
          <CarouselArrow
            direction="prev"
            onClick={goPrev}
            disabled={!canPrev}
            label="Previous packages"
            className="hidden md:inline-flex"
          />
          <div className="min-w-0 flex-1">
            <ServicePackageCardGroup>
              <div
                className={`grid min-w-0 items-start gap-4 sm:gap-5 md:gap-7 lg:gap-8 ${
                  cardsPerView === 2 ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                {loneLastDesktop ? (
                  <div
                    key={visible[0]!.id}
                    className="col-span-2 flex w-full min-w-0 justify-center"
                  >
                    <div className="w-full min-w-0 max-w-[calc((100%-0.75rem)/2)] sm:max-w-[calc((100%-1.25rem)/2)] md:max-w-[calc((100%-1.75rem)/2)] lg:max-w-[calc((100%-2rem)/2)]">
                      <ServicePackageCard pkg={visible[0]!} collapsibleDetails />
                    </div>
                  </div>
                ) : (
                  visible.map((pkg) => (
                    <ServicePackageCard key={pkg.id} pkg={pkg} collapsibleDetails />
                  ))
                )}
              </div>
            </ServicePackageCardGroup>
          </div>
          <CarouselArrow
            direction="next"
            onClick={goNext}
            disabled={!canNext}
            label="Next packages"
            className="hidden md:inline-flex"
          />
        </div>
        <div className="flex justify-center gap-10 md:hidden">
          <CarouselArrow
            direction="prev"
            onClick={goPrev}
            disabled={!canPrev}
            label="Previous packages"
          />
          <CarouselArrow
            direction="next"
            onClick={goNext}
            disabled={!canNext}
            label="Next packages"
          />
        </div>
      </div>
      {totalPages > 1 ? (
        <p
          className="mt-5 text-center font-body text-[10px] font-normal uppercase tracking-[0.14em] text-cream/50 md:mt-6 md:text-[11px]"
          aria-live="polite"
        >
          {safePage + 1} / {totalPages}
        </p>
      ) : null}
    </div>
  );
}
