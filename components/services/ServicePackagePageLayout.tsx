import type { ReactNode } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ServicePackageCard } from "@/components/services/ServicePackageCard";
import { ServicePackagesCarousel } from "@/components/services/ServicePackagesCarousel";
import {
  ServicePageCtaSection,
  type ServicePageCtaCopy,
} from "@/components/services/ServicePageCtaSection";
import { WhatToExpectSection } from "@/components/services/WhatToExpectSection";
import type { WhatToExpectContent } from "@/lib/service-what-to-expect";
import type { ServicePackageBlock } from "@/components/services/service-package-block";

export type { ServicePackageBlock };

type Props = {
  heroEyebrow: string;
  heroTitle: ReactNode;
  packages: ServicePackageBlock[];
  /** Burgundy band: small caps label above the heading. Omit for default; pass `null` to hide. */
  packagesSectionEyebrow?: ReactNode | null;
  /** Burgundy band: main heading above the cards. */
  packagesSectionTitle?: ReactNode;
  /** Burgundy band: supporting line under the title. */
  packagesSectionSubtitle?: ReactNode;
  /** Merged onto the inner hero container (e.g. extra vertical padding for long titles). */
  heroClassName?: string;
  /** Rendered between the cream hero and the first package band (e.g. diagrams). */
  afterHero?: ReactNode;
  /** Set false when the page renders its own bottom CTA (e.g. Pre-Launch Suite). */
  bottomCta?: false | ServicePageCtaCopy;
  /** Journey steps after package detail; omit to hide. */
  whatToExpect?: WhatToExpectContent;
  /** Extra classes on the burgundy packages band (e.g. more bottom padding). */
  packagesBandClassName?: string;
};

const defaultBottomCta: ServicePageCtaCopy = {
  title: (
    <>
      Ready to move forward with a partner who cares about the{" "}
      <em className="font-normal italic">details</em>?
    </>
  ),
};

export function ServicePackagePageLayout({
  heroEyebrow,
  heroTitle,
  packages,
  packagesSectionEyebrow,
  packagesSectionTitle = "Compare tiers",
  packagesSectionSubtitle,
  heroClassName = "",
  afterHero,
  bottomCta = defaultBottomCta,
  whatToExpect,
  packagesBandClassName = "",
}: Props) {
  const multiPackages = packages.length > 1;
  const packagesEyebrowResolved =
    packagesSectionEyebrow === undefined ? "[ Packages ]" : packagesSectionEyebrow;
  const resolvedPackagesSubtitle =
    packagesSectionSubtitle ??
    (multiPackages
      ? "Use the arrows to browse options. Open a card for the full overview, inclusions, and FAQs."
      : "Expand below for timelines, inclusions, add-ons, and FAQs.");
  return (
    <>
      <section className="bg-cream">
        <div
          className={`mx-auto flex min-h-[min(34vh,260px)] w-full max-w-[42rem] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[min(36vh,300px)] md:max-w-[48rem] md:min-h-[min(28vh,320px)] md:py-[clamp(2.5rem,6vh,3.75rem)] lg:min-h-[min(44vh,480px)] lg:py-[clamp(3.25rem,8vh,5rem)] ${heroClassName}`.trim()}
        >
          <SectionLabel className="mb-6">{heroEyebrow}</SectionLabel>
          <h1 className="cc-no-heading-hover text-burgundy">{heroTitle}</h1>
        </div>
      </section>

      {afterHero}

      <section
        className={`cc-service-packages-stack bg-burgundy px-4 pb-8 pt-10 sm:px-5 sm:pb-9 sm:pt-11 md:px-6 md:pb-8 md:pt-12 lg:px-8 lg:pb-10 lg:pt-14 ${packagesBandClassName}`.trim()}
        aria-label="Service packages"
      >
        <header className="mx-auto mb-4 max-w-2xl text-center md:mb-5">
          {packagesEyebrowResolved != null ? (
            <SectionLabel light className="mb-2 md:mb-2.5">
              {packagesEyebrowResolved}
            </SectionLabel>
          ) : null}
          <h2 className="cc-no-heading-hover font-display text-2xl font-normal leading-[1.12] tracking-[-0.02em] text-cream md:text-3xl md:leading-[1.1]">
            {packagesSectionTitle}
          </h2>
          <p className="cc-copy mx-auto mt-2.5 max-w-xl text-[12px] leading-relaxed text-cream/78 md:mt-3 md:text-[13px]">
            {resolvedPackagesSubtitle}
          </p>
        </header>

        {multiPackages ? (
          <ServicePackagesCarousel packages={packages} />
        ) : (
          <div className="mx-auto flex w-full justify-center px-1 sm:px-2">
            {packages.map((pkg) => (
              <ServicePackageCard key={pkg.id} pkg={pkg} collapsibleDetails={false} solo />
            ))}
          </div>
        )}
      </section>

      {whatToExpect ? (
        <WhatToExpectSection {...whatToExpect} className="border-t-0" />
      ) : null}

      {bottomCta !== false ? (
        <ServicePageCtaSection
          {...bottomCta}
          className={[bottomCta.className, !whatToExpect ? "border-t-0" : null]
            .filter(Boolean)
            .join(" ")}
        />
      ) : null}
    </>
  );
}
