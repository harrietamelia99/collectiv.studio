import type { ReactNode } from "react";

/** Inner panel for forms / fields — matches Inspiration link rows. */
export const PORTAL_FORM_WELL_CLASS =
  "rounded-xl border border-burgundy/12 bg-burgundy/[0.04] p-4 sm:p-5";

/** Client portal: gray well + white inputs (Feedback & messages composer, etc.). */
export const PORTAL_CLIENT_FORM_WELL_CLASS =
  "rounded-xl border border-zinc-200/80 bg-zinc-100/60 p-4 sm:p-5";

export const PORTAL_CLIENT_INPUT_CLASS =
  "w-full min-h-[44px] rounded-xl border border-zinc-200/90 bg-white px-3 py-2.5 font-body text-sm font-normal text-burgundy outline-none transition-shadow placeholder:text-zinc-400 focus:border-burgundy/25 focus:ring-2 focus:ring-burgundy/20";

/** Shown beside a portal subsection title when the client has saved content for that block. */
export function PortalStepSavedBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-950">
      Saved
    </span>
  );
}

type Variant = "client" | "studio";

/** Studio and client portals share the same editorial shell (white card, zinc rule). */
const shellByVariant: Record<Variant, string> = {
  client: "cc-portal-client-shell scroll-mt-28",
  studio: "cc-portal-client-shell scroll-mt-28",
};

type Props = {
  id?: string;
  headingId: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Client portal: stronger frame + shadow (matches Inspiration & mood). */
  variant?: Variant;
  className?: string;
};

export function PortalSectionCard({
  id,
  headingId,
  title,
  description,
  children,
  variant = "client",
  className = "",
}: Props) {
  const titleClass = "cc-portal-client-shell-title";

  const descWrapClass = "mt-4 max-w-none lg:max-w-4xl [&_p]:m-0 cc-portal-client-description";

  return (
    <section id={id} className={`${shellByVariant[variant]} ${className}`.trim()} aria-labelledby={headingId}>
      <h2 id={headingId} className={titleClass}>
        {title}
      </h2>
      {description ? <div className={descWrapClass}>{description}</div> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
