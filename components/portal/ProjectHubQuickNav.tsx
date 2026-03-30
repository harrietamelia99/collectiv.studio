import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

export type HubNavItem = {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export function ProjectHubQuickNav({
  items,
  ariaLabel,
  compact = false,
}: {
  items: HubNavItem[];
  ariaLabel: string;
  /** Tighter pills and spacing for client hub (less visual weight). */
  compact?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label={ariaLabel}
      className={`sticky z-30 top-[var(--portal-sticky-offset,4rem)] backdrop-blur-sm ${
        compact
          ? "mt-4 mb-5 rounded-xl border border-zinc-200/90 bg-white/95 py-2.5 shadow-sm supports-[backdrop-filter]:bg-white/90 sm:py-3"
          : "-mx-4 mb-8 border-b border-burgundy/12 bg-cream/95 py-2 supports-[backdrop-filter]:bg-cream/90 sm:-mx-1 sm:py-3"
      }`}
    >
      <div
        className={`flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden ${
          compact ? "gap-2 px-3 sm:gap-2 sm:px-3.5" : "gap-2 px-4 pb-2 sm:px-1 sm:pb-0"
        }`}
      >
        {items.map(({ href, label, Icon }) => {
          const className = compact
            ? "inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-zinc-200/90 bg-cream/40 px-3 py-1.5 font-body text-xs font-medium text-burgundy touch-manipulation transition-colors active:scale-[0.99] hover:border-zinc-300 hover:bg-white"
            : "inline-flex shrink-0 snap-start items-center gap-2 rounded-full border border-burgundy/15 bg-white px-3 py-2.5 font-body text-sm font-medium text-burgundy shadow-sm touch-manipulation transition-colors active:scale-[0.99] hover:border-burgundy hover:bg-burgundy/[0.06] sm:py-2";
          const iconClass = `shrink-0 ${compact ? "h-3.5 w-3.5 text-burgundy/75" : "h-4 w-4 text-burgundy/80"}`;
          const inner = (
            <>
              <Icon className={iconClass} />
              {label}
            </>
          );
          if (href.startsWith("#")) {
            return (
              <a key={href} href={href} className={className}>
                {inner}
              </a>
            );
          }
          return (
            <Link key={href} href={href} prefetch={false} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
