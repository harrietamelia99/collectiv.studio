import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { MotionSection } from "@/components/ui/SectionReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { marketingMetadata } from "@/lib/marketing-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Signage & Print - Collectiv. Studio | Bristol Design Agency",
  description:
    "Professionally designed signage and print materials for businesses. From shopfront signage to business cards and flyers. Based in Bristol.",
  path: "/signage-print",
});

export default function SignagePrintPage() {
  return (
    <>
      <MotionSection className="cc-rule-t-burgundy mt-6 bg-cream px-6 py-16 md:mt-8 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel className="mb-6 text-burgundy/85">[ Signage &amp; print ]</SectionLabel>
          <h1 className="cc-no-heading-hover text-burgundy">
            Signage and print that <em>carries your brand</em> into the real world
          </h1>
          <p className="cc-copy-muted mx-auto mt-6 max-w-2xl text-pretty">
            From shopfront signage to business cards, menus and flyers — we design print-ready artwork that matches your
            identity and reads clearly at a glance. Brief, approach and production specs are shaped with your
            suppliers or installers in mind.
          </p>
        </div>
      </MotionSection>

      <MotionSection className="bg-cream px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="cc-no-heading-hover text-xl text-burgundy sm:text-2xl">What we cover</h2>
          <p className="cc-copy text-burgundy/90">
            Exterior and interior signage concepts, wayfinding-friendly layouts, and coordinated print suites (cards,
            leaflets, packaging labels) — usually as part of a wider branding engagement so colours, type and logo use
            stay consistent everywhere you show up.
          </p>
          <p className="cc-copy text-burgundy/90">
            If you are refreshing an existing brand, we can audit what you already use outdoors and in print, then
            tighten the system so new pieces feel intentional rather than pieced together.
          </p>
          <h2 className="cc-no-heading-hover pt-4 text-xl text-burgundy sm:text-2xl">How it fits with branding</h2>
          <p className="cc-copy text-burgundy/90">
            Most signage and print work sits alongside or after identity design. See our full{" "}
            <Link href="/branding" className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2">
              branding packages
            </Link>{" "}
            for logos, colour systems and guidelines — or browse{" "}
            <Link href="/portfolio" className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2">
              past projects
            </Link>{" "}
            for print and environmental applications in context.
          </p>
        </div>
      </MotionSection>

      <MotionSection className="bg-burgundy px-6 py-16 text-center md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
          <SectionHeading light className="text-balance">
            Ready to brief signage or a print run?
          </SectionHeading>
          <ButtonLink href="/contactus" variant="cream" size="md">
            Get in touch
          </ButtonLink>
        </div>
      </MotionSection>
    </>
  );
}
