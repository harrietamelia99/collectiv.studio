import type { ReactNode } from "react";
import type { QuoteLine } from "@/lib/portal-quote-lines";
import {
  formatPoundsTotal,
  formatQuoteLineAmountForDisplay,
  quoteDepositSplit,
  sumQuoteLinePounds,
} from "@/lib/portal-quote-lines";
import { normalizePortalKind } from "@/lib/portal-project-kind";

type Props = {
  intro: string;
  lines: QuoteLine[];
  sentAt: Date;
  portalKind: string;
  depositPercent: number;
  depositNote: string;
  /** Accept / decline controls below deposit disclaimer (client portal only). */
  responseSlot?: ReactNode;
};

function ClientQuoteDepositBlock({
  portalKind,
  totalPounds,
  depositPercent,
  depositNote,
}: {
  portalKind: string;
  totalPounds: number;
  depositPercent: number;
  depositNote: string;
}) {
  const isSocial = normalizePortalKind(portalKind) === "SOCIAL";

  if (isSocial) {
    return (
      <div className="mt-6 border-t border-burgundy/15 pt-5">
        <p className="m-0 max-w-2xl font-body text-xs leading-relaxed text-burgundy/60">
          This is a monthly rolling subscription. Your first payment is due before your start date. By accepting this
          quote you agree to these payment terms.
        </p>
      </div>
    );
  }

  const { depositPounds, balancePounds, balancePercentDisplay, depositPercentDisplay } = quoteDepositSplit(
    totalPounds,
    depositPercent,
  );

  const customNote = depositNote.trim();
  const disclaimer = customNote
    ? customNote
    : `A ${depositPercentDisplay}% deposit is required to secure your project start date. The remaining balance is due before final files are released. By accepting this quote you agree to these payment terms.`;

  return (
    <div className="mt-6 space-y-4 border-t border-burgundy/15 pt-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-burgundy/75">
          Deposit due now
        </span>
        <span className="shrink-0 font-body text-sm font-semibold tabular-nums text-burgundy sm:text-right">
          {formatPoundsTotal(depositPounds)}{" "}
          <span className="font-normal text-burgundy/70">({depositPercentDisplay}%)</span>
        </span>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-burgundy/75">
          Balance due on completion
        </span>
        <span className="shrink-0 font-body text-sm font-semibold tabular-nums text-burgundy sm:text-right">
          {formatPoundsTotal(balancePounds)}{" "}
          <span className="font-normal text-burgundy/70">({balancePercentDisplay}%)</span>
        </span>
      </div>
      <p className="m-0 max-w-2xl font-body text-xs leading-relaxed text-burgundy/60">{disclaimer}</p>
    </div>
  );
}

export function ClientQuoteView({
  intro,
  lines,
  sentAt,
  portalKind,
  depositPercent,
  depositNote,
  responseSlot,
}: Props) {
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
              {formatQuoteLineAmountForDisplay(line.amount)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 border-t border-burgundy/15 pt-5">
        <span className="font-body text-sm font-semibold uppercase tracking-[0.06em] text-burgundy/75">Total</span>
        <span className="font-display text-xl tabular-nums text-burgundy md:text-2xl">{formatPoundsTotal(total)}</span>
      </div>
      <ClientQuoteDepositBlock
        portalKind={portalKind}
        totalPounds={total}
        depositPercent={depositPercent}
        depositNote={depositNote}
      />
      {responseSlot ? (
        <div className="mt-8 border-t border-burgundy/10 pt-8">{responseSlot}</div>
      ) : null}
    </section>
  );
}
