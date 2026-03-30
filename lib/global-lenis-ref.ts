import type Lenis from "lenis";

/** Set by `SmoothScroll` so portal hash navigation can use `lenis.scrollTo` (native scroll jumps miss Lenis). */
export const globalLenisRef: { current: Lenis | null } = { current: null };
