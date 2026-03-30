type Props = {
  summary: string | null;
  /** Shown when `summary` is null (no weekly template saved yet). */
  planningHref?: string;
};

export function SocialWeeklyDeliverablesBanner({ summary, planningHref }: Props) {
  if (summary) {
    return (
      <div
        className="rounded-xl border border-burgundy/20 bg-burgundy/[0.07] px-4 py-3 shadow-sm sm:px-5 sm:py-3.5"
        role="region"
        aria-label="Weekly deliverables for this account"
      >
        <p className="m-0 font-body text-sm font-medium leading-relaxed text-burgundy">{summary}</p>
      </div>
    );
  }
  if (!planningHref) return null;
  return (
    <div
      className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 sm:px-5"
      role="region"
      aria-label="Weekly schedule"
    >
      <p className="m-0 font-body text-sm leading-relaxed text-amber-950/90">
        <strong className="font-semibold">No weekly template yet.</strong> Set how many posts run each week (and what
        each slot is) on{" "}
        <a href={planningHref} className="font-medium text-burgundy underline decoration-burgundy/30 underline-offset-2">
          Content planning
        </a>{" "}
        — then this banner will show the agreed deliverables here.
      </p>
    </div>
  );
}
