"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";
import { IMAGE_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { LinkedInIcon } from "@/components/ui/SocialIcons";

/** Stable id segment per person (avoids duplicate DOM ids; used with accordion group). */
function teamMemberSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type TeamCardGroupContextValue = {
  openSlug: string | null;
  setOpenSlug: (slug: string | null) => void;
};

const TeamCardGroupContext = createContext<TeamCardGroupContextValue | null>(null);

/** Wrap sibling `TeamCard`s so only one “About me” panel is open at a time. */
export function TeamCardGroup({ children }: { children: ReactNode }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const value = useMemo(
    () => ({ openSlug, setOpenSlug }),
    [openSlug],
  );
  return (
    <TeamCardGroupContext.Provider value={value}>{children}</TeamCardGroupContext.Provider>
  );
}

export type TeamHighlight = {
  text: string;
  icon: ReactNode;
};

type Props = {
  name: string;
  role: string;
  imageSrc: string;
  className?: string;
  /** Optional link - external URLs render as a LinkedIn-style icon button; internal paths use `ctaLabel` text. */
  ctaHref?: string;
  /** Label for internal `ctaHref` only; omitted for external links (icon only). */
  ctaLabel?: string;
  /** Long paragraph - shown in the collapsible “About me” area when set; also used when highlights are omitted. */
  bio?: string;
  /** Icon + short lines; shown in the collapsible area only when `bio` is empty. */
  highlights?: TeamHighlight[];
};

function Chevron({ expanded, className }: { expanded: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={12}
      height={12}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        expanded ? "rotate-180" : "rotate-0"
      } ${className ?? ""}`}
      aria-hidden
    >
      <path
        d="M2 4.5L6 8.5L10 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TeamCard({
  name,
  role,
  imageSrc,
  className = "",
  ctaLabel,
  ctaHref,
  bio,
  highlights,
}: Props) {
  const group = useContext(TeamCardGroupContext);
  const slug = teamMemberSlug(name);
  const [soloExpanded, setSoloExpanded] = useState(false);
  const expanded = group ? group.openSlug === slug : soloExpanded;

  const toggleBio = () => {
    if (group) {
      group.setOpenSlug(expanded ? null : slug);
    } else {
      setSoloExpanded((v) => !v);
    }
  };

  const panelPrefix = slug;

  const hasBottomCta = Boolean(ctaHref?.trim());
  const isExternal = hasBottomCta && /^https?:\/\//i.test(ctaHref!);
  const linkedInCtaClass = ctaButtonClasses({
    variant: "burgundy",
    size: "sm",
    className: "h-10 w-10 min-w-0 shrink-0 !p-0 sm:h-11 sm:w-11",
  });
  const internalCtaClass = ctaButtonClasses({
    variant: "burgundy",
    size: "sm",
    className: "max-w-full shrink-0 px-4 sm:px-5",
  });

  const Cta = !hasBottomCta ? null : isExternal ? (
    <a
      href={ctaHref}
      target="_blank"
      rel="noopener noreferrer"
      className={linkedInCtaClass}
      aria-label={`${name} on LinkedIn`}
    >
      <LinkedInIcon className="h-[18px] w-[18px] text-cream sm:h-5 sm:w-5" />
    </a>
  ) : (
    <Link href={ctaHref!} className={internalCtaClass}>
      {ctaLabel?.trim() || "Learn more"}
    </Link>
  );

  const bioText = bio?.trim() ?? "";
  const hasHighlights = Boolean(highlights && highlights.length > 0);
  const useBioInPanel = Boolean(bioText);
  const hasCollapsible = useBioInPanel || hasHighlights;

  return (
    <article
      className={`group flex w-full flex-col self-start rounded-none border border-solid border-burgundy bg-cream shadow-soft transition-[transform,border-color,box-shadow] duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift ${className}`.trim()}
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-none bg-burgundy/[0.06]">
        <Image
          src={imageSrc}
          alt={`Portrait of ${name}`}
          fill
          className="object-cover object-center transition-transform duration-500 ease-smooth group-hover:scale-[1.04]"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
        />
      </div>
      <div className="flex flex-col px-6 pt-6 pb-5 text-center sm:px-7 md:px-8 md:pt-7 md:pb-6">
        <div className="mb-5 flex shrink-0 flex-col items-center gap-1.5 md:mb-6 md:gap-2">
          <h3 className="cc-no-heading-hover text-burgundy">{name}</h3>
          <p className="cc-caption-strong max-w-[20rem] text-burgundy/90">
            [ {role} ]
          </p>
        </div>
        {hasCollapsible ? (
          <div className="flex w-full max-w-[min(100%,30rem)] flex-col items-center gap-5 md:max-w-[32rem]">
            {/* grid-flow-col: always one row; flex+full width was still stacking on narrow viewports */}
            <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                id={`${panelPrefix}-toggle`}
                aria-expanded={expanded}
                aria-controls={`${panelPrefix}-about-panel`}
                aria-label={
                  expanded ? `Close ${name}’s bio` : `Read ${name}’s bio`
                }
                onClick={toggleBio}
                className={ctaButtonClasses({
                  variant: "outline",
                  size: "sm",
                  lift: false,
                  className: "inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 sm:px-5",
                })}
              >
                {expanded ? "Close" : "About me"}
                <Chevron expanded={expanded} className="text-burgundy" />
              </button>
              {hasBottomCta ? Cta : null}
            </div>
            {/* Native `hidden` is reliable; max-height + overflow chains were still collapsing to 0 in some layouts. */}
            <div
              id={`${panelPrefix}-about-panel`}
              role="region"
              aria-labelledby={`${panelPrefix}-toggle`}
              hidden={!expanded}
              className="w-full pt-4 text-left md:pt-5"
            >
              {useBioInPanel ? (
                <p className="cc-copy text-balance text-burgundy">{bioText}</p>
              ) : (
                <ul className="flex flex-col gap-3.5 md:gap-4">
                  {highlights!.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 md:gap-3.5">
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-burgundy/20 bg-burgundy/[0.04] text-burgundy md:h-10 md:w-10"
                        aria-hidden
                      >
                        {item.icon}
                      </span>
                      <p className="cc-copy-sm min-w-0 flex-1">{item.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : hasBottomCta ? (
          <div className="flex w-full shrink-0 justify-center pt-1">{Cta}</div>
        ) : null}
      </div>
    </article>
  );
}
