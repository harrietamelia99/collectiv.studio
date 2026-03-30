import { ButtonLink } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function PreLaunchSuiteCtaSection() {
  return (
    <section
      className="bg-cream px-6 py-16 text-center md:py-20"
      aria-labelledby="prelaunch-cta-heading"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 md:max-w-[42rem] md:gap-8">
        <SectionLabel className="text-burgundy/80">[ Next step ]</SectionLabel>
        <h2
          id="prelaunch-cta-heading"
          className="cc-no-heading-hover max-w-[min(100%,34rem)] text-balance text-burgundy md:max-w-[40rem]"
        >
          Ready to bring your brand to market with{" "}
          <em className="font-normal italic">intention</em>?
        </h2>
        <p className="mx-auto max-w-2xl text-pretty font-body text-[12px] font-normal leading-relaxed text-burgundy/72 md:text-[13px]">
          Tell us where you are and what you need. We&apos;ll confirm fit, timeline and the right
          package on a short call.
        </p>
        <ButtonLink href="/contactus" variant="burgundy" size="md" className="mt-1 tracking-[0.2em]">
          Book a discovery call
        </ButtonLink>
      </div>
    </section>
  );
}
