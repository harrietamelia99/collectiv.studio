"use client";

import { useId, useState } from "react";
import type { PackageAccordionBlock } from "@/lib/website-design-packages";

function Chevron({ open, className = "h-4 w-4" }: { open: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 text-burgundy transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusToggle({ open, className }: { open: boolean; className: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center text-cream transition-transform duration-200 ease-out group-hover:opacity-85 ${
        open ? "rotate-45" : ""
      } ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 md:h-[1.05rem] md:w-[1.05rem]"
      >
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function PanelContent({
  block,
  variant,
  compact,
  card,
}: {
  block: PackageAccordionBlock;
  variant: "default" | "onDark";
  compact?: boolean;
  card?: boolean;
}) {
  const fg = variant === "onDark" ? "text-cream/95" : "text-burgundy";
  const fgMuted = variant === "onDark" ? "text-cream/90" : "text-burgundy";
  const listSize =
    card && compact ? "text-[11px] leading-[1.55]" : compact ? "text-[12px] leading-[1.65]" : "text-[13px] leading-[1.7]";

  if (block.kind === "list") {
    return (
      <ul
        className={`list-disc pl-4 font-body font-normal ${listSize} ${
          card && compact ? "space-y-1" : compact ? "space-y-1.5" : "space-y-2.5"
        } ${fg}`}
      >
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  const faqSize = card && compact ? "text-[11px]" : compact ? "text-[12px]" : "text-[13px]";

  return (
    <div className={card && compact ? "space-y-2.5" : compact ? "space-y-3.5" : "space-y-5"}>
      {block.pairs.map(({ q, a }) => (
        <div key={q}>
          <p className={`font-body ${faqSize} font-normal leading-snug ${fgMuted}`}>
            <span className="font-medium">{q}</span>
          </p>
          <p className={`mt-1.5 font-body ${faqSize} font-normal leading-[1.7] ${fg}`}>{a}</p>
        </div>
      ))}
    </div>
  );
}

function AccordionRow({
  block,
  defaultOpen,
  variant,
  compact,
  card,
}: {
  block: PackageAccordionBlock;
  defaultOpen?: boolean;
  variant: "default" | "onDark";
  compact?: boolean;
  card?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const panelId = useId();
  const btnId = useId();
  const hairline =
    variant === "onDark"
      ? "border-[var(--cc-hairline-cream-on-burgundy)]"
      : "border-[var(--cc-hairline-package-seam)]";
  /** Same mono-style label on burgundy and cream bands (only colour changes). */
  const labelClass =
    variant === "onDark"
      ? card && compact
        ? "font-body text-[10px] font-normal uppercase leading-snug tracking-[0.1em] text-cream"
        : "font-body text-[11px] font-normal uppercase leading-snug tracking-[0.1em] text-cream md:text-xs"
      : card && compact
        ? "font-body text-[10px] font-normal uppercase leading-snug tracking-[0.1em] text-burgundy"
        : "font-body text-[11px] font-normal uppercase leading-snug tracking-[0.1em] text-burgundy md:text-xs";
  const colonClass =
    variant === "onDark" ? "font-normal text-cream/50" : "font-normal text-burgundy/45";

  return (
    <div className={`border-b-cc border-solid ${hairline}`}>
      <button
        id={btnId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`cc-no-lift flex w-full items-center justify-between gap-2 text-left transition-colors duration-200 sm:gap-3 md:gap-5 ${
          variant === "onDark"
            ? compact
              ? card
                ? "group rounded-none py-1.5 -mx-1 px-0.5 hover:bg-cream/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/35"
                : "group rounded-none py-2 -mx-1 px-1 hover:bg-cream/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/35 md:py-2.5"
              : "group rounded-none py-2.5 -mx-1 px-1 hover:bg-cream/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/35 md:py-3"
            : compact
              ? card
                ? "py-1.5 hover:opacity-80"
                : "py-2.5 hover:opacity-80 md:py-3"
              : "py-[1.05rem] hover:opacity-80 md:py-[1.15rem]"
        }`}
      >
        <span className={labelClass}>
          {block.title}
          <span className={colonClass} aria-hidden>
            :
          </span>
        </span>
        {variant === "onDark" ? (
          <PlusToggle open={open} className="" />
        ) : (
          <Chevron open={open} className={card && compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`grid min-h-0 transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`accordion-root pt-0 ${
              variant === "onDark"
                ? compact
                  ? card
                    ? "pb-1.5 pl-0.5"
                    : "pb-2.5 pl-0.5 md:pb-3.5"
                  : "pb-4 pl-0.5 md:pb-5"
                : compact
                  ? card
                    ? "pb-2"
                    : "pb-3.5"
                  : "pb-5"
            }`}
          >
            <PanelContent block={block} variant={variant} compact={compact} card={card} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PackageAccordion({
  blocks,
  defaultOpenIndex = 0,
  variant = "default",
  compact = false,
  card = false,
}: {
  blocks: PackageAccordionBlock[];
  /** First panel open on load (matches common “one section expanded” pattern). */
  defaultOpenIndex?: number | null;
  /** Burgundy panels (cream text, hairlines, + control). */
  variant?: "default" | "onDark";
  /** Tighter type and row padding for fixed-height package bands. */
  compact?: boolean;
  /** Extra-dense rows for viewport-height service cards (scrolls inside card). */
  card?: boolean;
}) {
  const topRule =
    variant === "onDark"
      ? "border-[var(--cc-hairline-cream-on-burgundy)]"
      : "border-[var(--cc-hairline-package-seam)]";

  const topGap =
    card && compact
      ? variant === "onDark"
        ? "mt-3"
        : "mt-2"
      : compact
        ? variant === "onDark"
          ? "mt-5"
          : "mt-4"
        : variant === "onDark"
          ? "mt-10"
          : "mt-8";

  return (
    <div className={`accordion-root border-t-cc border-solid ${topRule} ${topGap}`}>
      {blocks.map((block, i) => (
        <AccordionRow
          key={`${block.title}-${i}`}
          block={block}
          variant={variant}
          compact={compact}
          card={card}
          defaultOpen={defaultOpenIndex !== null && i === defaultOpenIndex}
        />
      ))}
    </div>
  );
}
