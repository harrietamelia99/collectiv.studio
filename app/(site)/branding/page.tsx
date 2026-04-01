import type { Metadata } from "next";
import { BrandingPageContent } from "@/components/services/BrandingPageContent";
import { marketingMetadata } from "@/lib/marketing-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Branding - Collectiv. Studio | Brand Identity Design Bristol",
  description:
    "Strategic brand identity design for ambitious businesses. Logos, colour systems, typography and brand guidelines. Based in Bristol, working across the UK.",
  path: "/branding",
});

export default function BrandingPage() {
  return <BrandingPageContent />;
}
