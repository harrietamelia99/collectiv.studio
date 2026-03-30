import type { Metadata } from "next";
import { SocialMediaPageContent } from "@/components/services/SocialMediaPageContent";

export const metadata: Metadata = {
  title: "Social Media Management - Collectiv. Studio",
  description:
    "Social packages from the Foundation Edit to Content Days - strategy, content, community and filming days for growing brands.",
};

export default function SocialMediaPage() {
  return <SocialMediaPageContent />;
}
