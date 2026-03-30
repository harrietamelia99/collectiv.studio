import type { Metadata } from "next";
import { WebsiteDesignPageContent } from "@/components/services/WebsiteDesignPageContent";

export const metadata: Metadata = {
  title: "Website Design - Collectiv. Studio",
  description:
    "Strategically built websites from launch pages to expansion builds. Packages, timelines and what’s included.",
};

export default function WebsiteDesignPage() {
  return <WebsiteDesignPageContent />;
}
