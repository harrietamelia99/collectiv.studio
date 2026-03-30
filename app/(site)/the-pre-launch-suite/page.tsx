import type { Metadata } from "next";
import { PreLaunchSuitePageContent } from "@/components/services/PreLaunchSuitePageContent";

export const metadata: Metadata = {
  title: "The Pre-Launch Suite - Collectiv. Studio",
  description:
    "Brand, site and launch social in one suite - identity, Shopify or Squarespace build, launch graphics and strategy for businesses ready to launch.",
};

export default function PreLaunchPage() {
  return <PreLaunchSuitePageContent />;
}
