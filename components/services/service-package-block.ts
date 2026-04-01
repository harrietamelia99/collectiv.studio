import type { ReactNode } from "react";
import type { PackageAccordionBlock } from "@/lib/website-design-packages";

export type ServicePackageBlock = {
  id: string;
  index: string;
  name: string;
  timeline: string;
  body: ReactNode;
  blocks: PackageAccordionBlock[];
  /** When set, replaces the cream placeholder column with a photo. */
  imageSrc?: string;
  imageAlt?: string;
  imageObjectPosition?: string;
  /** Use `contain` for tall portraits so the subject isn’t cropped by object-cover. */
  imageObjectFit?: "cover" | "contain";
  /** No image or placeholder row (e.g. Pre-Launch Suite solo card). */
  hideImage?: boolean;
};
