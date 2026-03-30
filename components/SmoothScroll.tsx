"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { globalLenisRef } from "@/lib/global-lenis-ref";

/**
 * Softer wheel / trackpad scrolling and smooth in-page anchors (e.g. #top).
 * Disabled when the user prefers reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      stopInertiaOnNavigate: true,
      anchors: {
        offset: 96,
        lerp: 0.12,
      },
    });

    globalLenisRef.current = lenis;

    return () => {
      globalLenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  return null;
}
