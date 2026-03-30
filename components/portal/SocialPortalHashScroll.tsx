"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { globalLenisRef } from "@/lib/global-lenis-ref";

/** Match `scroll-padding-top` in `app/globals.css` (nav clearance). */
const HEADER_SCROLL_OFFSET = 108;

function scrollToHashTarget(el: HTMLElement) {
  const lenis = globalLenisRef.current;
  if (lenis) {
    lenis.scrollTo(el, { offset: -HEADER_SCROLL_OFFSET, lerp: 0.12 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * App Router client navigations often don’t scroll to the URL hash target; Next also scrolls the new page to
 * the top by default (use `scroll={false}` on `Link` when the href includes `#`). This runs after the social
 * route is active, retries until the target is in the DOM (streaming), and uses Lenis when present.
 */
export function SocialPortalHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        scrollToHashTarget(el);
        return true;
      }
      return false;
    };

    if (tryScroll()) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 50;
    const t = window.setInterval(() => {
      if (cancelled) return;
      attempts += 1;
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(t);
      }
    }, 50);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [pathname]);

  return null;
}
