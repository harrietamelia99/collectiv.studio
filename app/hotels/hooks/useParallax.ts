"use client";

import { useScrollY } from "./useScrollY";

/** Background parallax offset from scroll position. */
export function useParallax(factor = 0.4) {
  const scrollY = useScrollY();
  return scrollY * factor;
}
