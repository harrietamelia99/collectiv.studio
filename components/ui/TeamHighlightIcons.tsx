/**
 * Team highlight row icons - 24×24, unified stroke (polished set).
 * Use with ~18–20px rendered size inside square cells.
 */

const sw = 1.5;

type IconProps = { className?: string };

export function IconBriefcase({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M8.5 7V5.75A1.75 1.75 0 0 1 10.25 4h3.5A1.75 1.75 0 0 1 15.5 5.75V7"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <rect
        x="4.25"
        y="7"
        width="15.5"
        height="12.5"
        rx="2"
        stroke="currentColor"
        strokeWidth={sw}
      />
      <path d="M4.25 11.75h15.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

/** Paint wells - reads clearly at small sizes */
export function IconPalette({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x="4.5"
        y="7.5"
        width="15"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth={sw}
      />
      <circle cx="9" cy="12.5" r="1.85" stroke="currentColor" strokeWidth={sw} />
      <circle cx="12" cy="12.5" r="1.85" stroke="currentColor" strokeWidth={sw} />
      <circle cx="15" cy="12.5" r="1.85" stroke="currentColor" strokeWidth={sw} />
    </svg>
  );
}

/** Star in circle - strategy / vision */
export function IconCompass({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M12 6.75 13.35 11.05 18.2 11.75l-3.75 2.7 1.15 4.45L12 16.35l-3.6 2.55 1.15-4.45-3.75-2.7 4.85-.7L12 6.75Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** End-to-end delivery */
export function IconKanban({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M9.25 4.75h5.5a1.25 1.25 0 0 1 1.25 1.25v1.25H8V6a1.25 1.25 0 0 1 1.25-1.25Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <rect
        x="5.75"
        y="7.25"
        width="12.5"
        height="13.5"
        rx="1.75"
        stroke="currentColor"
        strokeWidth={sw}
      />
      <path
        d="M9 11.25h6M9 14.25h6M9 17.25h4.25"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="8.5" r="2.65" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M4.75 19.25v-.35c0-2.1 1.7-3.85 3.85-3.85h.8c2.15 0 3.85 1.75 3.85 3.85v.35"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <circle cx="16.25" cy="9" r="2.2" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M13.75 19.25h5.75v-.4c0-1.55-1-2.85-2.5-3.25"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMessages({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M6.25 6.75h11.5A2.25 2.25 0 0 1 20 9v5.25a2.25 2.25 0 0 1-2.25 2.25h-3.9l-3.55 2.95V16.5H6.25A2.25 2.25 0 0 1 4 14.25V9a2.25 2.25 0 0 1 2.25-2.25Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M8.25 10.75h7.5M8.25 13.25h5"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSocialNodes({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="17.5" cy="6.5" r="2.35" stroke="currentColor" strokeWidth={sw} />
      <circle cx="6.5" cy="12" r="2.35" stroke="currentColor" strokeWidth={sw} />
      <circle cx="17.5" cy="17.5" r="2.35" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M8.55 11.05C10.2 9.35 12.9 8.25 15.15 7.35"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <path
        d="M8.55 12.95c1.65 1.7 4.35 2.8 6.6 3.7"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Brand sparkle - primary star + accent */
export function IconBrandSpark({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M12 5.5l1.15 3.35h3.55l-2.9 2.1 1.1 3.45L12 14.2l-2.9 2.2 1.1-3.45-2.9-2.1h3.55L12 5.5Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M17.75 15.25l.65 1.35 1.35.65-1.35.65-.65 1.35-.65-1.35-1.35-.65 1.35-.65.65-1.35Z"
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCamera({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M5 9.25h2.65l1.35-2h6l1.35 2H19a1.25 1.25 0 0 1 1.25 1.25v7.5A1.25 1.25 0 0 1 19 19.25H5a1.25 1.25 0 0 1-1.25-1.25v-7.5A1.25 1.25 0 0 1 5 9.25Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.75" r="3.4" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M17.25 10.5h.01"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
