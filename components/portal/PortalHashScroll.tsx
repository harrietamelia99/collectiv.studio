"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHashId(): void {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scheduleHashScroll(): () => void {
  const delays = [0, 80, 200, 450];
  const timers = delays.map((ms) => window.setTimeout(() => scrollToHashId(), ms));
  return () => timers.forEach((t) => window.clearTimeout(t));
}

/**
 * Next.js client navigation often skips native hash scrolling. Smooth-scroll to `#id` when the URL
 * hash targets an element on the page (same path or after /portal navigations).
 */
export function PortalHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/portal")) return;

    const clearScheduled = scheduleHashScroll();
    window.addEventListener("hashchange", scrollToHashId);

    const onClickCapture = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a?.href) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.origin);
      } catch {
        return;
      }
      if (!url.pathname.startsWith("/portal")) return;
      if (url.pathname !== window.location.pathname) return;
      const id = url.hash.replace(/^#/, "");
      if (!id) return;
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => {
      clearScheduled();
      window.removeEventListener("hashchange", scrollToHashId);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [pathname]);

  return null;
}
