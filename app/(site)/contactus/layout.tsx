import type { Metadata } from "next";
import { marketingMetadata } from "@/lib/marketing-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Contact Us - Collectiv. Studio | Get in Touch",
  description:
    "Ready to start your project? Get in touch with the Collectiv. Studio team. Based in Bristol, working with businesses across the UK.",
  path: "/contactus",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
