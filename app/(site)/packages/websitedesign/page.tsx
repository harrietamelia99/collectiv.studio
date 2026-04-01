import type { Metadata } from "next";
import { WebsiteDesignPageContent } from "@/components/services/WebsiteDesignPageContent";
import { marketingMetadata } from "@/lib/marketing-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Website Design - Collectiv. Studio | Custom Web Design UK",
  description:
    "Bespoke website design and development for growing businesses. We build fast, beautiful custom websites using Next.js. Based in Bristol, working across the UK.",
  path: "/packages/websitedesign",
});

export default function WebsiteDesignPage() {
  return <WebsiteDesignPageContent />;
}
