import type { Metadata } from "next";
import { PreLaunchSuitePageContent } from "@/components/services/PreLaunchSuitePageContent";
import { marketingMetadata } from "@/lib/marketing-seo";

export const metadata: Metadata = marketingMetadata({
  title: "The Pre-Launch Suite - Collectiv. Studio | Brand, Web & Social",
  description:
    "Everything you need to launch your business - branding, website and social media setup in one complete package. Based in Bristol.",
  path: "/the-pre-launch-suite",
});

export default function PreLaunchPage() {
  return <PreLaunchSuitePageContent />;
}
