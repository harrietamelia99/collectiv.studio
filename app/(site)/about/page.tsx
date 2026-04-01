import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IMAGE_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { FaqSection } from "@/components/about/FaqSection";
import { prisma } from "@/lib/prisma";
import { WhatToExpectSection } from "@/components/services/WhatToExpectSection";
import { ButtonLink } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LogoMarquee } from "@/components/ui/LogoMarquee";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionSection } from "@/components/ui/SectionReveal";
import { aboutPageWhatToExpect } from "@/lib/service-what-to-expect";
import { teamBioHarriet, teamBioIsabella, teamBioMay } from "@/lib/team-bios";
import { TEAM_HEADSHOT_PUBLIC_PATH } from "@/lib/team-headshots";
import { TeamCard, TeamCardGroup } from "@/components/ui/TeamCard";
import { marketingMetadata } from "@/lib/marketing-seo";

export const metadata: Metadata = marketingMetadata({
  title: "About Us - Collectiv. Studio | Bristol Creative Agency",
  description:
    "Meet the team behind Collectiv. Studio. We are a boutique brand and web design agency based in Bristol, helping businesses build distinctive brands and websites.",
  path: "/about",
});

export default async function AboutPage() {
  let dynamicFaqs: { id: string; question: string; answer: string }[] = [];
  try {
    dynamicFaqs = await prisma.siteFaq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, question: true, answer: true },
    });
  } catch {
    /* e.g. deploy env uses non-SQLite DATABASE_URL — still show static FAQs */
  }

  return (
    <>
      {/* Cream statement - sits under fixed nav; tighter vertical rhythm than the old burgundy band. */}
      <MotionSection className="relative -mt-[92px] cc-rule-t-burgundy bg-cream p-0 lg:-mt-[100px]">
        <div className="cc-hero-spacer h-[108px] shrink-0 lg:h-[116px]" aria-hidden />
        {/* Vertical padding + min-height aligned with `ServicePackagePageLayout` cream hero */}
        <div className="mx-auto flex min-h-[min(34vh,260px)] w-full max-w-[42rem] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[min(36vh,300px)] md:max-w-[48rem] md:min-h-[min(28vh,320px)] md:px-10 md:py-[clamp(2.5rem,6vh,3.75rem)] lg:min-h-[min(44vh,480px)] lg:py-[clamp(3.25rem,8vh,5rem)]">
          <SectionLabel className="mb-6 text-burgundy/85">
            [ We are Collectiv. ]
          </SectionLabel>
          <SectionHeading
            as="h1"
            className="mx-auto max-w-[min(100%,40rem)] md:max-w-4xl"
          >
            We believe in strategic, cohesive{" "}
            <em>brand, web and social design</em> that elevates your presence and
            attracts clients who truly align.
          </SectionHeading>
        </div>
      </MotionSection>

      <MotionSection className="relative z-[1] overflow-hidden bg-burgundy p-0">
        <div className="grid min-h-0 grid-cols-1 md:grid-cols-2 md:min-h-[min(80dvh,680px)]">
          <div className="flex flex-col justify-center px-8 py-12 sm:px-10 md:py-16 lg:px-14 xl:pl-20 xl:pr-16">
            <SectionLabel light className="tracking-[0.08em] text-cream/90">
              360° Brand Studio
            </SectionLabel>
            <h2 className="cc-no-heading-hover mt-4 text-cream md:mt-6">
              An independent creative studio.
            </h2>
            <p className="cc-copy-light mt-5 max-w-xl md:mt-6">
              Our mission is to build strategically designed brand, web and social
              foundations that position ambitious businesses for long-term growth.
              We don&apos;t just design for aesthetics - we design with clarity,
              intention and purpose.
            </p>
            <p className="cc-copy-light mt-4 max-w-xl md:mt-5">
              Collectiv is a UK-based boutique studio, partnering with ambitious
              founders to create cohesive digital ecosystems that work as
              beautifully as they look.
            </p>
            <p className="cc-copy-light mt-5 max-w-xl text-[13px] leading-relaxed text-cream/85 md:mt-6">
              Explore our{" "}
              <Link href="/packages/websitedesign" className="underline decoration-cream/40 underline-offset-2 hover:decoration-cream">
                website design
              </Link>
              ,{" "}
              <Link href="/branding" className="underline decoration-cream/40 underline-offset-2 hover:decoration-cream">
                branding
              </Link>
              ,{" "}
              <Link href="/social-media-management" className="underline decoration-cream/40 underline-offset-2 hover:decoration-cream">
                social media
              </Link>{" "}
              and{" "}
              <Link href="/the-pre-launch-suite" className="underline decoration-cream/40 underline-offset-2 hover:decoration-cream">
                Pre-Launch Suite
              </Link>
              , browse the{" "}
              <Link href="/portfolio" className="underline decoration-cream/40 underline-offset-2 hover:decoration-cream">
                portfolio
              </Link>
              , or{" "}
              <Link href="/contactus" className="underline decoration-cream/40 underline-offset-2 hover:decoration-cream">
                get in touch
              </Link>
              .
            </p>
            <ButtonLink
              href="/contactus"
              variant="cream"
              size="lg"
              className="mt-8 w-max md:mt-10"
            >
              Learn more
            </ButtonLink>
          </div>
          <div className="relative min-h-[48vh] w-full border-t border-solid border-[var(--cc-hairline-on-dark)] md:min-h-full md:border-l md:border-t-0">
            <Image
              src="/images/about-independent-studio.png"
              alt="Collectiv studio workspace with laptop and coffee"
              fill
              className="object-cover object-[center_45%]"
              sizes="(max-width: 767px) 100vw, 50vw"
              priority
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
            />
          </div>
        </div>
      </MotionSection>

      <WhatToExpectSection {...aboutPageWhatToExpect} sectionId="about-what-to-expect-heading" />

      <MotionSection className="bg-cream px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="cc-no-heading-hover mb-10 text-burgundy">
            Questions, <em>answered</em>
          </h2>
          <FaqSection dynamicFaqs={dynamicFaqs} />
        </div>
      </MotionSection>

      <MotionSection className="bg-cream py-6 md:py-8">
        <LogoMarquee />
      </MotionSection>

      <MotionSection className="bg-burgundy px-6 py-16 text-center md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 md:max-w-[42rem] md:gap-10">
          <h2 className="cc-no-heading-hover max-w-[min(100%,34rem)] text-balance text-cream md:max-w-[40rem]">
            Ready to bring <em>clarity</em> and <em>intention</em> to your brand?
          </h2>
          <ButtonLink href="/contactus" variant="cream">
            Book a discovery call
          </ButtonLink>
        </div>
      </MotionSection>

      <MotionSection className="bg-cream px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <SectionLabel className="mx-auto mb-4 max-w-[48rem] text-burgundy/80 md:mb-5">
            [ Who we are ]
          </SectionLabel>
          <h2 className="cc-no-heading-hover mb-14 text-burgundy md:mb-20">
            Meet <em>the team</em>
          </h2>
          <TeamCardGroup>
            <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-3 md:gap-x-10 md:gap-y-12 lg:gap-x-12">
              <TeamCard
                name="Harriet Pearce"
                role="founder & creative director"
                imageSrc={TEAM_HEADSHOT_PUBLIC_PATH.harriet}
                ctaHref="https://linkedin.com/in/harrietpearce/"
                bio={teamBioHarriet}
              />
              <TeamCard
                name="Isabella Pearce"
                role="client operations manager"
                imageSrc={TEAM_HEADSHOT_PUBLIC_PATH.isabella}
                ctaHref="https://linkedin.com/in/theisabellapearce/"
                bio={teamBioIsabella}
              />
              <TeamCard
                name="May Custance"
                role="Social Media Lead"
                imageSrc={TEAM_HEADSHOT_PUBLIC_PATH.may}
                ctaHref="https://linkedin.com/in/may-custance-74a1b8376/"
                bio={teamBioMay}
              />
            </div>
          </TeamCardGroup>
        </div>
      </MotionSection>
    </>
  );
}
