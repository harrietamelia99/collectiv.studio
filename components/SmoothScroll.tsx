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

    let lenis: Lenis | null = null;

    const start = () => {
      lenis = new Lenis({
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
    };

    let cancelled = false;
    let idleHandle: number | undefined;
    let timeoutId = 0;

    const runStart = () => {
      if (cancelled) return;
      start();
    };

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(runStart, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(runStart, 0);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutId) window.clearTimeout(timeoutId);
      globalLenisRef.current = null;
      lenis?.destroy();
    };
  }, []);

  return null;
}
