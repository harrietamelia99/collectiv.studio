import type { ReactNode } from "react";
import type { QuoteLine } from "@/lib/portal-quote-lines";
import { formatPoundsTotal, sumQuoteLinePounds } from "@/lib/portal-quote-lines";

type Props = {
  intro: string;
  lines: QuoteLine[];
  sentAt: Date;
  /** Accept / decline controls rendered below the total (client portal only). */
  responseSlot?: ReactNode;
};

export function ClientQuoteView({ intro, lines, sentAt, responseSlot }: Props) {
  const total = sumQuoteLinePounds(lines);

  return (
    <section
      className="cc-portal-client-shell mt-8 rounded-cc-card border border-burgundy/10 bg-white/80 px-5 py-6 shadow-sm sm:px-7 sm:py-8"
      aria-labelledby="your-quote-heading"
    >
      <h2 id="your-quote-heading" className="cc-portal-client-shell-title pb-1 text-xl md:text-2xl">
        Your quote
      </h2>
      <p className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-burgundy/60">
        Shared {sentAt.toLocaleDateString(undefined, { dateStyle: "long" })}
      </p>
      {intro.trim() ? (
        <p className="mt-5 max-w-2xl font-body text-base font-medium leading-relaxed text-burgundy">{intro.trim()}</p>
      ) : null}
      <ul className="mt-6 space-y-4 border-t border-zinc-200/90 pt-6">
        {lines.map((line, i) => (
          <li
            key={i}
            className="flex flex-col gap-1 border-b border-zinc-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
          >
            <div className="min-w-0">
              <span className="font-body text-sm font-semibold text-burgundy">{line.label}</span>
              {line.detail ? (
                <span className="mt-1 block font-body text-sm leading-relaxed text-burgundy/70">{line.detail}</span>
              ) : null}
            </div>
            <span className="shrink-0 font-body text-sm font-medium tabular-nums text-burgundy sm:pt-0.5">
              {line.amount}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 border-t border-burgundy/15 pt-5">
        <span className="font-body text-sm font-semibold uppercase tracking-[0.06em] text-burgundy/75">Total</span>
        <span className="font-display text-xl tabular-nums text-burgundy md:text-2xl">{formatPoundsTotal(total)}</span>
      </div>
      {responseSlot ? (
        <div className="mt-8 border-t border-burgundy/10 pt-8">{responseSlot}</div>
      ) : null}
    </section>
  );
}
