import type { Metadata } from "next";
import type { PortfolioProject } from "@/lib/portfolio";

/** Canonical marketing origin (www). */
export const MARKETING_SITE_URL = "https://www.collectivstudio.uk";

/** Default Open Graph / Twitter image (1200×630). Regenerate: `npm run og:generate`. */
export const OG_IMAGE_PATH = "/og-collectiv-studio.png";

/** Default `<title>` / `og:title` / LinkedIn headline (homepage + root metadata fallback). */
export const DEFAULT_SITE_TITLE =
  "Collectiv. Studio - Brand, Web & Social Media Agency | Bristol";

/** Default meta description / `og:description` for social previews. */
export const DEFAULT_SITE_DESCRIPTION =
  "Collectiv. Studio is a boutique creative agency offering brand strategy, website design and social media management. Based in Bristol, working with businesses across the UK.";

export function absoluteMarketingUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return MARKETING_SITE_URL;
  return `${MARKETING_SITE_URL}${normalized}`;
}

/**
 * Standard metadata for public marketing routes: title, description, canonical, OG, Twitter.
 * Set `metadataBase` on the root layout once; image paths may be relative to it.
 */
export function marketingMetadata(options: {
  title: string;
  description: string;
  /** Path only, e.g. `/about` or `/` */
  path: string;
  /** Optional OG/Twitter image path under public (defaults to OG_IMAGE_PATH). */
  ogImagePath?: string;
}): Metadata {
  const path = options.path === "" ? "/" : options.path.startsWith("/") ? options.path : `/${options.path}`;
  const canonical = absoluteMarketingUrl(path);
  const ogPath = options.ogImagePath ?? OG_IMAGE_PATH;

  return {
    title: options.title,
    description: options.description,
    alternates: { canonical },
    openGraph: {
      title: options.title,
      description: options.description,
      url: canonical,
      siteName: "Collectiv. Studio",
      type: "website",
      locale: "en_GB",
      images: [
        {
          url: ogPath,
          width: 1200,
          height: 630,
          alt: "Collectiv. Studio — boutique brand, web and social creative agency",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [ogPath],
    },
  };
}

/** Service URLs for internal linking from portfolio case studies (deduped). */
export function portfolioServiceLinks(
  project: Pick<PortfolioProject, "type" | "services">,
): readonly { href: string; label: string }[] {
  const t = [project.type, ...project.services].join(" ").toLowerCase();
  const links: { href: string; label: string }[] = [];
  const add = (href: string, label: string) => {
    if (!links.some((l) => l.href === href)) links.push({ href, label });
  };
  if (t.includes("social")) add("/social-media-management", "social media management");
  if (t.includes("website") || t.includes("squarespace") || t.includes("next.js")) add("/packages/websitedesign", "website design");
  if (t.includes("branding") || t.includes("brand")) add("/branding", "branding");
  if (t.includes("print") || t.includes("signage")) add("/signage-print", "signage and print");
  if (links.length === 0) add("/branding", "branding");
  return links;
}
