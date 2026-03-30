import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Designed empty state: icon, copy, optional CTA — use wherever lists can be empty.
 */
export function PortalEmptyState({ icon: Icon, title, description, action, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200/90 bg-gradient-to-b from-zinc-50/80 to-white px-6 py-12 text-center shadow-sm sm:px-10 ${className}`.trim()}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-burgundy/[0.06] text-burgundy/70 ring-1 ring-burgundy/10">
        <Icon className="h-7 w-7 stroke-[1.25]" aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-lg tracking-[-0.02em] text-burgundy">{title}</h3>
      <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-burgundy/65">{description}</p>
      {action ? <div className="mt-6 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
