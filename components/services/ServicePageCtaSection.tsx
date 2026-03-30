import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export type ServicePageCtaCopy = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  buttonLabel?: string;
  href?: string;
  className?: string;
};

const defaultDescription =
  "Tell us where you are and what you need—we'll confirm fit, timeline and the right way to work together.";

export function ServicePageCtaSection({
  eyebrow = "[ Next step ]",
  title,
  description = defaultDescription,
  buttonLabel = "Get in touch",
  href = "/contactus",
  className = "",
}: ServicePageCtaCopy) {
  return (
    <section
      className={`bg-cream px-6 py-16 text-center md:py-20 ${className}`.trim()}
      aria-labelledby="service-page-cta-heading"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 md:max-w-[42rem] md:gap-8">
        <SectionLabel className="text-burgundy/80">{eyebrow}</SectionLabel>
        <h2
          id="service-page-cta-heading"
          className="cc-no-heading-hover max-w-[min(100%,34rem)] text-balance text-burgundy md:max-w-[40rem]"
        >
          {title}
        </h2>
        <p className="mx-auto max-w-2xl text-pretty font-body text-[12px] font-normal leading-relaxed text-burgundy/72 md:text-[13px]">
          {description}
        </p>
        <ButtonLink href={href} variant="burgundy" size="md" className="mt-1 tracking-[0.2em]">
          {buttonLabel}
        </ButtonLink>
      </div>
    </section>
  );
}
