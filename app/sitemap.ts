import type { MetadataRoute } from "next";
import { MARKETING_SITE_URL } from "@/lib/marketing-seo";
import { portfolioProjects } from "@/lib/portfolio";

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const base = MARKETING_SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/packages/websitedesign`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/branding`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/signage-print`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/social-media-management`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/the-pre-launch-suite`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contactus`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  const caseStudies: MetadataRoute.Sitemap = portfolioProjects.map((p) => ({
    url: `${base}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...caseStudies];
}
