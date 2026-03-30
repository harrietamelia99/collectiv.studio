export function PhaseProgressBar({
  label,
  percent,
  hint,
  variant = "panel",
  stepNumber,
  lockedVisual,
}: {
  label: string;
  percent: number;
  hint?: string;
  /** `embedded` — no outer card; clearer title for hub tiles. */
  variant?: "panel" | "embedded";
  /** Client hub tiles: 1-based step index within the workstream. */
  stepNumber?: number;
  /** Muted track / label for locked workflow steps (0% progress). */
  lockedVisual?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const bar = (
    <>
      <div
        className={
          variant === "embedded"
            ? `flex items-baseline justify-between gap-3 ${lockedVisual ? "opacity-70" : ""}`
            : `flex items-baseline justify-between gap-3 font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55 ${lockedVisual ? "opacity-70" : ""}`
        }
      >
        {variant === "embedded" ? (
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 font-display text-lg tracking-[-0.02em] text-burgundy">
            {stepNumber != null ? (
              <span className="shrink-0 rounded-md bg-burgundy/12 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-burgundy">
                Step {stepNumber}
              </span>
            ) : null}
            <span className="min-w-0 leading-tight">{label}</span>
          </span>
        ) : (
          <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">{label}</span>
        )}
        <span
          className={`shrink-0 font-body text-sm font-semibold tabular-nums ${lockedVisual ? "text-burgundy/45" : "text-burgundy"}`}
        >
          {clamped}%
        </span>
      </div>
      <div
        className={`h-1.5 w-full overflow-hidden rounded-full ${
          variant === "embedded"
            ? lockedVisual
              ? "mt-2 bg-zinc-200/90"
              : "mt-2 bg-burgundy/10"
            : lockedVisual
              ? "mt-2.5 bg-zinc-200/90"
              : "mt-2.5 bg-zinc-200"
        }`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-smooth ${
            lockedVisual ? "bg-zinc-400/80" : "bg-burgundy"
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {hint ? (
        <p
          className={`font-body leading-relaxed ${lockedVisual ? "text-burgundy/50" : "text-burgundy/65"} ${variant === "embedded" ? "mt-2 text-sm" : "mt-2 text-[11px]"}`}
        >
          {hint}
        </p>
      ) : null}
    </>
  );

  if (variant === "embedded") {
    return <div className="min-w-0 flex-1">{bar}</div>;
  }

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white px-4 py-3.5 shadow-sm">
      {bar}
    </div>
  );
}
