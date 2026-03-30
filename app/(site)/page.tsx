import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { LogoMarquee } from "@/components/ui/LogoMarquee";
import {
  MotionSection,
  StaggerItem,
  StaggerList,
} from "@/components/ui/SectionReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { HomePortalSection } from "@/components/home/HomePortalSection";
import { HomeStatsStrip } from "@/components/home/HomeStatsStrip";
import { teamBioHarriet, teamBioIsabella, teamBioMay } from "@/lib/team-bios";
import { TEAM_HEADSHOT_PUBLIC_PATH } from "@/lib/team-headshots";
import { TeamCard, TeamCardGroup } from "@/components/ui/TeamCard";
import { HomeHeroCopy } from "@/components/home/HomeHeroCopy";
import { HomeContactForm } from "@/components/home/HomeContactForm";
import { HomeFeaturedProjectRotator } from "@/components/home/HomeFeaturedProjectRotator";
import {
  HomeInstagramSection,
  HomeInstagramSectionFallback,
} from "@/components/home/HomeInstagramSection";
import { TestimonialCarousel } from "@/components/ui/TestimonialCarousel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const services = [
  {
    title: "Website Design",
    description:
      "Thoughtfully designed websites that blend aesthetics with performance.",
    image: "/images/service-website.png",
    href: "/packages/websitedesign",
  },
  {
    title: "Launch Packages",
    description: "Your full launch, handled, from identity to online presence.",
    image: "/images/service-launch.png",
    href: "/the-pre-launch-suite",
  },
  {
    title: "Logo + Branding",
    description: "A distinctive logo and visual identity designed to set you apart.",
    image: "/images/home-logo-branding-card.png",
    href: "/branding",
  },
  {
    title: "Social Media Management",
    description: "We handle your socials, so you can focus on running your business.",
    image: "/images/service-social.png",
    href: "/social-media-management",
  },
  {
    title: "Signage + Print",
    description: "From shopfronts to business cards, print that makes an impact.",
    image: "/images/home-service-signage.png",
    href: "/branding",
  },
  {
    title: "Content Days",
    description: "High-impact content, captured in a single streamlined session.",
    image: "/images/service-content-days.png",
    href: "/social-media-management",
  },
];

const homeStats = [
  { value: "6+", label: "years experience" },
  { value: "50+", label: "happy clients" },
  { value: "9,000+", label: "designs created" },
] as const;

export default async function HomePage() {
  let featuredReviews: { id: string; reviewText: string; reviewerName: string }[] = [];
  try {
    featuredReviews = await prisma.publishedClientReview.findMany({
      where: { featuredOnHome: true, rating: 5 },
      orderBy: { submittedAt: "desc" },
      take: 12,
      select: { id: true, reviewText: true, reviewerName: true },
    });
  } catch {
    /* e.g. Vercel without DATABASE_URL or DB unreachable — page still renders */
  }

  const dbTestimonials = featuredReviews.map((r) => ({
    id: r.id,
    text: r.reviewText,
    name: r.reviewerName,
  }));

  return (
    <>
      {/* Full-bleed looped video + burgundy scrim; solid bg fallback. Negative margin pulls hero under main padding so the pill nav sits over the hero. */}
      <MotionSection className="cc-hero-home relative -mt-[92px] flex min-h-svh flex-col overflow-hidden bg-burgundy text-center lg:-mt-[100px] lg:min-h-[88dvh]">
        <div
          className="cc-hero-video-wrap pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <video
            className="cc-hero-bg-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 bg-gradient-to-b from-burgundy/70 via-burgundy/55 to-burgundy/58"
            aria-hidden
          />
        </div>
        {/* Clears fixed pill nav; mobile height follows content (no full-viewport min) so the band isn’t mostly empty below the CTA */}
        <div className="cc-hero-spacer h-[108px] shrink-0 lg:h-[116px]" aria-hidden />
        <div className="cc-hero-stage relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.25rem))] pt-8 sm:px-5 sm:pt-10 lg:px-10 lg:pb-8 lg:pt-10">
          <HomeHeroCopy />
        </div>
      </MotionSection>

      <MotionSection className="bg-cream py-6 md:py-8">
        <LogoMarquee />
      </MotionSection>

      <MotionSection className="cc-home-services-band bg-burgundy">
        <div className="cc-container cc-home-services-inner mx-auto max-w-6xl text-center">
          <SectionLabel light className="mb-4 text-cream/75 md:mb-5">
            [ What we do ]
          </SectionLabel>
          <SectionHeading
            light
            className="mx-auto mb-14 max-w-[48rem] md:mb-20"
          >
            Explore <em>our services</em>
          </SectionHeading>
          <StaggerList className="cc-home-services-grid grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 lg:gap-6">
            {services.map((s) => (
              <StaggerItem key={s.href + s.title} className="h-full min-h-0">
                <ServiceCard
                  title={s.title}
                  description={s.description}
                  imageSrc={s.image}
                  href={s.href}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </MotionSection>

      <MotionSection className="cc-home-stats-strip bg-cream">
        <HomeStatsStrip items={homeStats} />
      </MotionSection>

      <Suspense fallback={<HomeInstagramSectionFallback />}>
        <HomeInstagramSection />
      </Suspense>

      <HomeContactForm />

      <MotionSection className="flex min-h-0 items-center justify-center bg-burgundy px-5 py-10 md:min-h-[min(62vh,34rem)] md:px-6 md:py-24">
        <TestimonialCarousel dbQuotes={dbTestimonials} />
      </MotionSection>

      <MotionSection className="bg-cream px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-start md:justify-between">
            <SectionHeading align="left" className="max-w-md">
              Past <em>projects</em>
            </SectionHeading>
            <p className="cc-copy-muted max-w-md md:text-right">
              Explore a curated selection of recent projects across social media,
              branding and website design.
            </p>
          </div>
          <HomeFeaturedProjectRotator />
          <div className="mt-14 flex justify-center">
            <ButtonLink href="/portfolio" variant="outline">
              View our full portfolio
            </ButtonLink>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="bg-cream px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <SectionLabel className="mx-auto mb-4 max-w-[48rem] text-burgundy/80 md:mb-5">
            [ Who we are ]
          </SectionLabel>
          <SectionHeading className="mx-auto mb-14 max-w-[48rem] md:mb-20">
            Meet <em>the team</em>
          </SectionHeading>
          <TeamCardGroup>
            <StaggerList className="grid grid-cols-1 items-start gap-12 md:grid-cols-3 md:gap-x-10 md:gap-y-12 lg:gap-x-12">
              <StaggerItem className="flex w-full flex-col self-start">
                <TeamCard
                  name="Harriet Pearce"
                  role="founder & creative director"
                  imageSrc={TEAM_HEADSHOT_PUBLIC_PATH.harriet}
                  ctaHref="https://linkedin.com/in/harrietpearce/"
                  bio={teamBioHarriet}
                />
              </StaggerItem>
              <StaggerItem className="flex w-full flex-col self-start">
                <TeamCard
                  name="Isabella Pearce"
                  role="client operations manager"
                  imageSrc={TEAM_HEADSHOT_PUBLIC_PATH.isabella}
                  ctaHref="https://linkedin.com/in/theisabellapearce/"
                  bio={teamBioIsabella}
                />
              </StaggerItem>
              <StaggerItem className="flex w-full flex-col self-start">
                <TeamCard
                  name="May Custance"
                  role="Social Media Lead"
                  imageSrc={TEAM_HEADSHOT_PUBLIC_PATH.may}
                  ctaHref="https://linkedin.com/in/may-custance-74a1b8376/"
                  bio={teamBioMay}
                />
              </StaggerItem>
            </StaggerList>
          </TeamCardGroup>
        </div>
      </MotionSection>

      <HomePortalSection />
    </>
  );
}
