import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioCaseStudy } from "@/components/portfolio/PortfolioCaseStudy";
import { getAdjacentProjects, getProjectBySlug, portfolioProjects } from "@/lib/portfolio";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return portfolioProjects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return { title: "Project | Collectiv. Studio" };
  }
  return {
    title: `${project.title} | Portfolio - Collectiv. Studio`,
    description: project.tagline,
  };
}

export default function PortfolioCasePage({ params }: Props) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  const adjacent = getAdjacentProjects(params.slug);
  if (!adjacent) notFound();
  const { prev, next } = adjacent;

  return (
    <div className="cc-portfolio-case-study bg-cream">
      <PortfolioCaseStudy project={project} prev={prev} next={next} />
    </div>
  );
}
