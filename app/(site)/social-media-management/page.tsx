import type { Metadata } from "next";
import { SocialMediaPageContent } from "@/components/services/SocialMediaPageContent";
import { marketingMetadata } from "@/lib/marketing-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Social Media Management - Collectiv. Studio | UK Agency",
  description:
    "Done-for-you social media management for businesses who want to show up consistently online. Content creation, scheduling and strategy. Based in Bristol.",
  path: "/social-media-management",
});

export default function SocialMediaPage() {
  return <SocialMediaPageContent />;
}
