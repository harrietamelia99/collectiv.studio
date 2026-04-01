import type { PortfolioProject } from "@/lib/portfolio";
import { absoluteMarketingUrl } from "@/lib/marketing-seo";

type Props = { project: PortfolioProject };

export function PortfolioCreativeWorkJsonLd({ project }: Props) {
  const images: string[] = [];
  if (project.image) images.push(absoluteMarketingUrl(project.image));
  if (project.galleryImages) {
    for (const g of project.galleryImages) {
      if (g) images.push(absoluteMarketingUrl(g));
    }
  }

  const description = `${project.tagline} ${project.overview}`.replace(/\s+/g, " ").trim().slice(0, 500);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description,
    ...(images.length ? { image: images } : {}),
    creator: {
      "@type": "Organization",
      name: "Collectiv. Studio",
      url: absoluteMarketingUrl("/"),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
