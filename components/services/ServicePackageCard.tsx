"use client";

import Image from "next/image";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ImagePlaceholderFill } from "@/components/ui/ImagePlaceholder";
import { IMAGE_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { ButtonLink, ctaButtonClasses } from "@/components/ui/Button";
import { PackageAccordion } from "@/components/services/PackageAccordion";
import type { ServicePackageBlock } from "@/components/services/service-package-block";

/** Same chevron motion as `TeamCard` (click-to-expand pattern). */
function DetailsChevron({ expanded, className }: { expanded: boolean; className?: string }) {
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

type GroupCtx = { openId: string | null; setOpenId: (id: string | null) => void };

const ServicePackageCardGroupContext = createContext<GroupCtx | null>(null);

/** When several packages render as cards, only one details panel is open at a time (matches team section). */
export function ServicePackageCardGroup({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const value = useMemo(() => ({ openId, setOpenId }), [openId]);
  return (
    <ServicePackageCardGroupContext.Provider value={value}>{children}</ServicePackageCardGroupContext.Provider>
  );
}

type Props = {
  pkg: ServicePackageBlock;
  /** Multiple packages on the page — use expand/collapse; single package shows everything open. */
  collapsibleDetails: boolean;
  /** Single-package pages: stacked card with a full-width hero image (no narrow side column). */
  solo?: boolean;
};

export function ServicePackageCard({ pkg, collapsibleDetails, solo = false }: Props) {
  const group = useContext(ServicePackageCardGroupContext);
  const [soloOpen, setSoloOpen] = useState(false);

  const expanded = collapsibleDetails
    ? group
      ? group.openId === pkg.id
      : soloOpen
    : true;

  const toggleDetails = () => {
    if (!collapsibleDetails) return;
    if (group) {
      group.setOpenId(expanded ? null : pkg.id);
    } else {
      setSoloOpen((v) => !v);
    }
  };

  const panelPrefix = pkg.id.replace(/[^a-zA-Z0-9_-]/g, "-");
  const toggleId = `${panelPrefix}-details-toggle`;
  const panelDomId = `${panelPrefix}-details-panel`;

  const carouselMobile =
    collapsibleDetails && !solo;

  return (
    <article
      id={pkg.id}
      className={`group flex overflow-hidden border-cc border-solid border-burgundy/10 bg-cream shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-smooth hover:-translate-y-1 hover:border-burgundy/22 hover:shadow-lift ${
        solo
          ? /* Stacked layout: full-width image avoids tight side-column crops on square / flat-lay photos */
            "w-full max-w-lg flex-col sm:max-w-xl md:max-w-3xl lg:max-w-[56rem]"
          : `flex-col ${collapsibleDetails ? "min-w-0" : "md:col-span-2 md:max-w-2xl md:justify-self-center"} ${
              carouselMobile
                ? "mx-auto w-full max-w-[17.5rem] sm:max-w-xs md:mx-0 md:max-w-none"
                : ""
            }`
      }`.trim()}
    >
      {!pkg.hideImage ? (
        <div
          className={`relative w-full shrink-0 overflow-hidden bg-burgundy/[0.06] ${
            solo
              ? "aspect-[4/3] w-full"
              : carouselMobile
                ? /* 4:3 matches typical photography better than 16:9 — avoids cropping laptop / desk tops */
                  "aspect-[4/3] w-full"
                : "aspect-[16/9]"
          }`}
        >
          {pkg.imageSrc ? (
            <Image
              src={pkg.imageSrc}
              alt={pkg.imageAlt ?? ""}
              fill
              className={`${pkg.imageObjectFit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-500 ease-smooth group-hover:scale-[1.03]`}
              style={pkg.imageObjectPosition ? { objectPosition: pkg.imageObjectPosition } : undefined}
              sizes={
                solo
                  ? "(max-width: 767px) 100vw, (max-width: 1200px) 90vw, 896px"
                  : carouselMobile
                    ? "(max-width: 767px) 280px, (max-width: 1200px) 48vw, 400px"
                    : "(max-width: 767px) 100vw, (max-width: 1200px) 48vw, 400px"
              }
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
            />
          ) : (
            <ImagePlaceholderFill tone="cream" />
          )}
        </div>
      ) : null}

      <div className={`flex min-w-0 flex-col text-left ${solo ? "md:flex-1" : ""}`}>
        <div className="shrink-0 px-4 pt-3 sm:px-5 sm:pt-4">
          <p className="cc-caption mb-1.5 tracking-[0.16em] text-burgundy/55">{pkg.index} /</p>
          <h2
            className={`cc-no-heading-hover text-balance font-display font-normal leading-[1.15] tracking-[-0.02em] text-burgundy ${
              solo
                ? "text-lg sm:text-xl md:text-xl lg:text-[1.35rem]"
                : "text-xl sm:text-[1.35rem] md:text-2xl"
            }`}
          >
            {pkg.name}
          </h2>
          <p className="cc-copy-muted mt-1.5 normal-case tracking-[0.03em] text-[10px] leading-snug text-burgundy/75 sm:text-[11px]">
            Timeline: {pkg.timeline}
          </p>
        </div>

        {collapsibleDetails ? (
          <div className="px-4 pt-2.5 sm:px-5 sm:pt-3">
            <button
              type="button"
              id={toggleId}
              aria-expanded={expanded}
              aria-controls={panelDomId}
              aria-label={expanded ? `Hide details for ${pkg.name}` : `Show details for ${pkg.name}`}
              onClick={toggleDetails}
              className={ctaButtonClasses({
                variant: "outline",
                size: "sm",
                lift: false,
                className:
                  "cc-no-lift flex w-full min-w-0 items-start justify-between gap-2 px-3 py-2.5 text-left sm:items-center sm:gap-3 sm:px-4",
              })}
            >
              <span className="min-w-0 flex-1 break-words font-body text-[10px] font-normal uppercase leading-snug tracking-[0.06em] text-burgundy sm:text-[11px] sm:tracking-[0.07em] md:text-xs">
                {expanded ? "Close details" : "Overview & details"}
              </span>
              <DetailsChevron expanded={expanded} className="mt-0.5 shrink-0 text-burgundy sm:mt-0" />
            </button>
          </div>
        ) : null}

        <div
          id={panelDomId}
          role="region"
          aria-labelledby={collapsibleDetails ? toggleId : undefined}
          hidden={collapsibleDetails ? !expanded : false}
          className={
            collapsibleDetails
              ? "border-t border-solid border-burgundy/10 px-4 pb-1 pt-3 sm:px-5 sm:pb-2 sm:pt-4"
              : "px-4 pb-1 pt-2 sm:px-5 sm:pb-2 sm:pt-3"
          }
        >
          <div className="cc-copy space-y-1.5 pb-3 text-[11px] leading-snug text-burgundy/95 sm:pb-4 sm:text-[12px] sm:leading-relaxed">
            {pkg.body}
          </div>
          <PackageAccordion blocks={pkg.blocks} defaultOpenIndex={null} variant="default" compact />
        </div>

        <div
          className={`shrink-0 border-t border-solid border-burgundy/10 px-4 pt-3.5 sm:px-5 sm:pt-4 ${
            solo
              ? pkg.hideImage
                ? "pb-11 sm:pb-12 md:pb-14"
                : "pb-8 sm:pb-9 md:pb-10"
              : "pb-8 sm:pb-9 md:pb-10"
          }`}
        >
          <ButtonLink
            href="/contactus"
            variant="burgundy"
            size="sm"
            lift={false}
            className={`justify-center !shadow-soft hover:opacity-[0.96] ${
              solo ? "w-full md:inline-flex md:w-auto md:min-w-[10.5rem]" : "w-full"
            }`}
          >
            Learn more
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
