import type { AmenityKey } from "../data";

const svgProps = {
  viewBox: "0 0 24 24",
  className: "hw-amenity__icon",
  "aria-hidden": true as const,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const AMENITY_ICONS: Record<AmenityKey, JSX.Element> = {
  sun: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  pool: (
    <svg {...svgProps}>
      <path d="M2 12c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5" />
      <path d="M2 17c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5" />
    </svg>
  ),
  dining: (
    <svg {...svgProps}>
      <path d="M6 3v7M4 3v4M8 3v4M6 10v11" />
      <path d="M17 3v18M14 3v7a3 3 0 0 0 6 0V3" />
    </svg>
  ),
  spa: (
    <svg {...svgProps}>
      <path d="M12 3c2.5 3.5 5.5 5.5 5.5 9.5a5.5 5.5 0 1 1-11 0C6.5 8.5 9.5 6.5 12 3z" />
      <path d="M12 14v3" />
    </svg>
  ),
  concierge: (
    <svg {...svgProps}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M12 2v1" />
    </svg>
  ),
  transport: (
    <svg {...svgProps}>
      <path d="M4 17h16l-1.5-6.5a2 2 0 0 0-2-1.5H7.5a2 2 0 0 0-2 1.5L4 17z" />
      <path d="M4 11h16" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  ),
  fire: (
    <svg {...svgProps}>
      <path d="M12 22c3.5-2.5 5.5-5 5.5-8.5a5 5 0 0 0-8.5-3.5c-.5 2.5-2 3.5-2 6a3 3 0 0 0 5 2.5c0-1.5-.5-2.5-.5-4 1.5 1.5 1.5 3.5 1.5 3.5s1-2 1-4.5a6 6 0 0 1 1.5 8.5z" />
    </svg>
  ),
  grounds: (
    <svg {...svgProps}>
      <path d="M12 22V12" />
      <path d="M12 12C9 12 6.5 9.5 6.5 6.5 9.5 6.5 12 9 12 12" />
      <path d="M12 12c3 0 5.5-2.5 5.5-5.5C14.5 6.5 12 9 12 12" />
    </svg>
  ),
  dog: (
    <svg {...svgProps}>
      <path d="M11 14a2 2 0 0 0 2 0" />
      <path d="M16 11h.01M8 11h.01" />
      <path d="M12 18c-3.5 0-6-2-6-5.5 0-2 1.5-3.5 3.5-4 .5-1.5 1.5-2.5 2.5-2.5s2 1 2.5 2.5c2 .5 3.5 2 3.5 4 0 3.5-2.5 5.5-6 5.5z" />
      <path d="M8 6.5a1.5 1.5 0 0 1-3 0M19 6.5a1.5 1.5 0 0 0-3 0" />
    </svg>
  ),
  tea: (
    <svg {...svgProps}>
      <path d="M6 8h11v5.5a4.5 4.5 0 0 1-4.5 4.5H10A4.5 4.5 0 0 1 5.5 13.5V8z" />
      <path d="M17 10h1.5a2 2 0 0 1 0 4H17" />
      <path d="M8 4v2M12 4v2M16 4v2" />
    </svg>
  ),
  bar: (
    <svg {...svgProps}>
      <path d="M8 22h8" />
      <path d="M12 22V12" />
      <path d="M7 4h10l-5 8-5-8z" />
    </svg>
  ),
  cinema: (
    <svg {...svgProps}>
      <rect x="3" y="5" width="18" height="13" rx="2" />
      <path d="M10 9.5v5l4.5-2.5L10 9.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
  lounge: (
    <svg {...svgProps}>
      <path d="M5 18V10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8" />
      <path d="M5 18H3v2h18v-2h-2" />
      <path d="M5 14h14" />
    </svg>
  ),
  valet: (
    <svg {...svgProps}>
      <path d="M5 17h14" />
      <path d="M6.5 17 8 9h8l1.5 8" />
      <path d="M6 9h12" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  ),
  shop: (
    <svg {...svgProps}>
      <path d="M7 9V7a5 5 0 0 1 10 0v2" />
      <path d="M6 9h12l-1.2 11H7.2L6 9z" />
    </svg>
  ),
};
