import type { QuoteLine } from "@/lib/portal-quote-lines";

type Props = {
  intro: string;
  lines: QuoteLine[];
  sentAt: Date;
};

export function ClientQuoteView({ intro, lines, sentAt }: Props) {
  return (
    <section
      className="cc-portal-client-shell mt-8"
      aria-labelledby="your-quote-heading"
    >
      <h2
        id="your-quote-heading"
        className="cc-portal-client-shell-title pb-2"
      >
        Your quote
      </h2>
      <p className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-burgundy/70">
        Shared {sentAt.toLocaleDateString(undefined, { dateStyle: "long" })}
      </p>
      {intro ? (
        <p className="mt-4 font-body text-sm leading-relaxed text-burgundy/80 whitespace-pre-wrap">{intro}</p>
      ) : null}
      <ul className="mt-5 space-y-3 border-t border-zinc-200 pt-5">
        {lines.map((line, i) => (
          <li key={i} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <div>
              <span className="font-body text-sm font-medium text-burgundy">{line.label}</span>
              {line.detail ? (
                <span className="mt-0.5 block font-body text-sm text-burgundy/65">{line.detail}</span>
              ) : null}
            </div>
            <span className="shrink-0 font-body text-sm tabular-nums text-burgundy">{line.amount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
