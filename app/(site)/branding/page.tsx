import type { Metadata } from "next";
import { BrandingPageContent } from "@/components/services/BrandingPageContent";

export const metadata: Metadata = {
  title: "Branding - Collectiv. Studio",
  description:
    "Full branding, logo design, print and signage - packages, timelines and what’s included for Bristol and UK businesses.",
};

export default function BrandingPage() {
  return <BrandingPageContent />;
}
