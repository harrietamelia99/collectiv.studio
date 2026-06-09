"use client";

import { useEffect, useState, type RefObject } from "react";

/** Subtle parallax offset based on element position in the viewport (not page scroll). */
export function useElementParallax(
  ref: RefObject<HTMLElement | null>,
  factor = 0.35,
  maxShift = 72,
) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const progress = (center - vh / 2) / vh;
      const next = Math.max(-maxShift, Math.min(maxShift, progress * maxShift * factor * 4));
      setOffset(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [factor, maxShift]);

  return offset;
}
