import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioCreativeWorkJsonLd } from "@/components/marketing/PortfolioCreativeWorkJsonLd";
import { PortfolioCaseStudy } from "@/components/portfolio/PortfolioCaseStudy";
import { marketingMetadata } from "@/lib/marketing-seo";
import { getAdjacentProjects, getProjectBySlug, portfolioProjects } from "@/lib/portfolio";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return portfolioProjects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return { title: "Portfolio | Collectiv. Studio" };
  }
  return marketingMetadata({
    title: `${project.title} — ${project.type} | Collectiv. Studio Portfolio`,
    description: `${project.tagline} A ${project.type} project by Collectiv. Studio, Bristol creative agency.`,
    path: `/portfolio/${params.slug}`,
    ogImagePath: project.image,
  });
}

export default function PortfolioCasePage({ params }: Props) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  const adjacent = getAdjacentProjects(params.slug);
  if (!adjacent) notFound();
  const { prev, next } = adjacent;

  return (
    <>
      <PortfolioCreativeWorkJsonLd project={project} />
      <div className="cc-portfolio-case-study bg-cream">
        <PortfolioCaseStudy project={project} prev={prev} next={next} />
      </div>
    </>
  );
}
