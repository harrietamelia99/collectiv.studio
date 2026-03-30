import type { WhatToExpectContent, WhatToExpectStep } from "@/lib/service-what-to-expect";
import { SectionLabel } from "@/components/ui/SectionLabel";

type Props = WhatToExpectContent & {
  /** Stable id for `aria-labelledby` (page-scoped). */
  sectionId?: string;
  className?: string;
};

export function WhatToExpectSection({
  heading,
  steps,
  sectionId = "what-to-expect-heading",
  className = "",
}: Props) {
  if (steps.length === 0) return null;

  return (
    <section
      className={`bg-cream px-6 py-14 md:px-10 md:py-20 ${className}`.trim()}
      aria-labelledby={sectionId}
    >
      <div className="mx-auto max-w-6xl">
        <SectionLabel className="mb-4 text-center text-burgundy/75 md:mb-5">
          [ What to expect ]
        </SectionLabel>
        <h2
          id={sectionId}
          className="cc-no-heading-hover mx-auto mb-10 max-w-2xl text-center text-burgundy md:mb-14 md:max-w-3xl"
        >
          {heading}
        </h2>

        <ol className="m-0 flex list-none flex-col items-center gap-3 p-0 md:hidden">
          {steps.map((step, i) => (
            <li key={step.title} className="flex w-full max-w-[min(100%,26rem)] flex-col items-center gap-3">
              <StepCard step={step} index={i} variant="mobile" />
              {i < steps.length - 1 ? (
                <span
                  className="font-body text-base font-light leading-none text-burgundy/35"
                  aria-hidden
                >
                  ↓
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        {/* 6 steps: single-row 5+1fr grid broke the 6th card; use 2×3 then 3×2 for clear reading order */}
        <ol className="m-0 hidden list-none gap-5 p-0 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6 xl:gap-8">
          {steps.map((step, i) => (
            <li key={step.title} className="flex min-h-0 min-w-0">
              <StepCard step={step} index={i} variant="grid" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  variant,
}: {
  step: WhatToExpectStep;
  index: number;
  variant: "mobile" | "grid";
}) {
  const align = variant === "mobile" ? "text-center" : "text-left";
  return (
    <div
      className={`flex h-full min-h-0 w-full min-w-0 flex-col border-cc border-solid border-burgundy/12 bg-white/40 px-5 py-6 shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-smooth motion-safe:hover:-translate-y-0.5 hover:border-burgundy/22 hover:shadow-lift sm:px-6 sm:py-7 ${align} rounded-none`}
    >
      <span className="mb-2 shrink-0 font-body text-[11px] font-normal tabular-nums tracking-[0.18em] text-burgundy/45">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="shrink-0 font-display text-lg font-medium leading-snug tracking-[-0.02em] text-burgundy sm:text-xl">
        {step.title}
      </span>
      <p className="cc-copy-muted mt-3 flex-1 text-[13px] leading-relaxed text-burgundy/75 sm:mt-3.5 sm:text-sm">
        {step.description}
      </p>
    </div>
  );
}
