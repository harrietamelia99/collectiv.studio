"use client";

import { usePathname } from "next/navigation";

const AUTH_SEGMENTS = /\/portal\/(login|register|forgot-password|reset-password)(\/|$)/;

type Props = {
  showStudio: boolean;
  /** Logged-in client (not studio): bottom tab bar on phone */
  showClientMobileNav?: boolean;
};

/**
 * In-flow spacer so page content isn’t covered by the fixed bottom tab bar.
 */
export function PortalBottomSpacer({ showStudio, showClientMobileNav = false }: Props) {
  const pathname = usePathname() || "";
  if (AUTH_SEGMENTS.test(pathname)) return null;

  const h = "min-h-[calc(4.75rem+env(safe-area-inset-bottom,0px))]";

  if (showStudio) {
    return <div className={`shrink-0 ${h} lg:hidden`} aria-hidden />;
  }

  if (showClientMobileNav) {
    return <div className={`shrink-0 ${h} md:hidden`} aria-hidden />;
  }

  return null;
}
