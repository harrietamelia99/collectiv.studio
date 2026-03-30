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
};
