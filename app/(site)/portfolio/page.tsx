import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioCard } from "@/components/ui/PortfolioCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { marketingMetadata } from "@/lib/marketing-seo";
import { portfolioProjects } from "@/lib/portfolio";

export const metadata: Metadata = marketingMetadata({
  title: "Our Work - Collectiv. Studio | Brand & Web Design Portfolio",
  description:
    "Browse our portfolio of brand identity, website design and social media projects. See how we have helped businesses across the UK build distinctive brands.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  const count = portfolioProjects.length;

  return (
    <>
      <section className="bg-cream">
        <div className="mx-auto flex min-h-[min(34vh,260px)] w-full max-w-[42rem] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[min(36vh,300px)] md:max-w-[48rem] md:min-h-[min(28vh,320px)] md:py-[clamp(2.5rem,6vh,3.75rem)] lg:min-h-[min(44vh,480px)] lg:py-[clamp(3.25rem,8vh,5rem)]">
          <SectionLabel className="mb-6 text-burgundy/85">[ Portfolio ]</SectionLabel>
          <h1 className="cc-no-heading-hover text-burgundy">
            Our brand &amp; web design <em className="font-normal italic">portfolio</em>
          </h1>
          <p className="cc-copy-muted mx-auto mt-6 max-w-2xl text-pretty md:mt-7">
            A curated set of recent collaborations - brand, web and social, built for founders who care
            how they show up online. Planning something similar?{" "}
            <Link href="/contactus" className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2">
              Tell us about your project
            </Link>
            .
          </p>
          <p className="cc-caption-light mt-5 tabular-nums tracking-[0.18em] text-burgundy/55 md:mt-6">
            {String(count).padStart(2, "0")} projects
          </p>
        </div>
      </section>

      <section className="bg-cream px-6 pb-16 pt-10 md:pb-24 md:pt-12">
        <div className="cc-outline-hairline mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-12 lg:px-10 lg:py-14">
          <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
            {portfolioProjects.map((p, i) => (
              <li key={p.slug} className="min-w-0">
                <PortfolioCard
                  title={p.title}
                  subtitle={p.type}
                  imageSrc={p.image}
                  href={`/portfolio/${p.slug}`}
                  index={i + 1}
                  imageObjectPosition={p.imageObjectPosition}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
