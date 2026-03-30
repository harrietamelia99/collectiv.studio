"use client";

import { useEffect } from "react";

/** Enables smooth scrolling for in-page hash links (e.g. agency dashboard quick nav). */
export function PortalSmoothScroll() {
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);
  return null;
}
