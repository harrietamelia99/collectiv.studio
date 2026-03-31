"use client";

import { useEffect, useMemo, useState } from "react";
import { saveProjectQuote, sendProjectQuote } from "@/app/portal/actions";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import type { PortalFormFlash } from "@/lib/portal-form-flash";
import type { QuoteLineRow } from "@/lib/portal-quote-lines";
import { formatPoundsTotal, parseQuoteLineItemsJson, sumQuoteLinePounds } from "@/lib/portal-quote-lines";

type Props = {
  projectId: string;
  initialIntro: string;
  initialLineItemsJson: string;
  sentAt: Date | null;
};

const emptyLine = (): QuoteLineRow => ({ label: "", detail: "", amount: "" });

export function AgencyProjectQuotePanel({
  projectId,
  initialIntro,
  initialLineItemsJson,
  sentAt,
}: Props) {
  const parsed = useMemo(() => parseQuoteLineItemsJson(initialLineItemsJson), [initialLineItemsJson]);
  const [intro, setIntro] = useState(initialIntro);
  const [lines, setLines] = useState<QuoteLineRow[]>(() => (parsed.length ? parsed : [emptyLine()]));
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [sentAtState, setSentAtState] = useState<Date | null>(sentAt);

  useEffect(() => {
    setSentAtState(sentAt);
  }, [sentAt]);

  const total = sumQuoteLinePounds(lines);
  const validLines = lines.filter((l) => l.label.trim() && l.amount.trim());
  const lineItemsJson = JSON.stringify(validLines);
  const canSend = validLines.length > 0;

  const saveAction = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => saveProjectQuote(projectId, fd),
    [projectId],
  );

  const sendAction = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => sendProjectQuote(projectId, fd),
    [projectId],
  );

  return (
    <div id="agency-project-quote" className="scroll-mt-28 mt-8 border-t border-zinc-100 pt-8">
      <h3 className="font-display text-base tracking-[-0.02em] text-burgundy">Client quote</h3>
      <p className="mt-1 font-body text-xs leading-relaxed text-burgundy/55">
        Short summary plus line items in pounds. After you send, the client sees this above their contract.
      </p>

      <PortalFormWithFlash
        action={saveAction}
        className="mt-4 space-y-4"
        defaultSuccessMessage="Quote saved ✓"
        onFlash={(f) => {
          if (f.ok) setLastSavedAt(new Date());
        }}
      >
        <label className="block font-body text-xs font-medium text-burgundy/70">
          Project summary (one sentence)
          <input
            name="intro"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className={`${PORTAL_CLIENT_INPUT_CLASS} mt-1.5`}
            placeholder="e.g. A new marketing site, brand kit, and launch support."
            maxLength={4000}
          />
        </label>

        <input type="hidden" name="lineItemsJson" value={lineItemsJson} />

        <div className="space-y-3">
          <p className="font-body text-xs font-medium text-burgundy/70">Line items</p>
          {lines.map((line, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-3 sm:flex-row sm:flex-wrap sm:items-end"
            >
              <label className="min-w-0 flex-1 font-body text-[11px] font-medium text-burgundy/65">
                Description
                <input
                  value={line.label}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLines((prev) => prev.map((row, j) => (j === i ? { ...row, label: v } : row)));
                  }}
                  className={`${PORTAL_CLIENT_INPUT_CLASS} mt-1 font-body text-sm`}
                  placeholder="Deliverable or phase"
                />
              </label>
              <label className="w-full font-body text-[11px] font-medium text-burgundy/65 sm:w-36">
                Price (£)
                <input
                  value={line.amount}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLines((prev) => prev.map((row, j) => (j === i ? { ...row, amount: v } : row)));
                  }}
                  className={`${PORTAL_CLIENT_INPUT_CLASS} mt-1 font-body text-sm tabular-nums`}
                  placeholder="1200 or £1,200"
                  inputMode="decimal"
                />
              </label>
              <button
                type="button"
                className="rounded-[var(--cc-pill-radius)] border border-burgundy bg-transparent px-5 py-2.5 font-body text-[11px] uppercase tracking-[0.07em] text-burgundy hover:bg-burgundy/[0.06] sm:w-auto"
                onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                disabled={lines.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-[var(--cc-pill-radius)] border border-burgundy bg-transparent px-5 py-2.5 font-body text-[11px] uppercase tracking-[0.07em] text-burgundy hover:bg-burgundy/[0.06]"
            onClick={() => setLines((prev) => [...prev, emptyLine()])}
          >
            Add line
          </button>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-zinc-200/80 pt-4">
          <span className="font-body text-sm font-semibold text-burgundy">Total (from line amounts)</span>
          <span className="font-body text-base font-semibold tabular-nums text-burgundy">{formatPoundsTotal(total)}</span>
        </div>

        <div className="flex flex-col gap-1">
          <PortalFormSubmitButton
            idleLabel="Save Quote"
            pendingLabel="Saving…"
            successLabel="Quote saved ✓"
            errorFallback="Save failed - try again"
            variant="burgundy"
            size="sm"
          />
          {lastSavedAt ? (
            <p className="font-body text-xs text-burgundy/60">
              Last saved at{" "}
              {lastSavedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          ) : null}
        </div>
      </PortalFormWithFlash>

      <div className="mt-4 rounded-lg border border-zinc-200/80 bg-white px-4 py-3 font-body text-sm text-burgundy/80">
        {sentAtState ? (
          <p className="m-0">
            <span className="font-medium text-burgundy">Sent to client</span> ·{" "}
            {sentAtState.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        ) : (
          <p className="m-0 text-burgundy/65">Quote not sent yet — the client only sees it after you send.</p>
        )}
      </div>

      <PortalFormWithFlash
        action={sendAction}
        className="mt-3"
        defaultSuccessMessage="Quote sent ✓"
        onFlash={(f) => {
          if (f.ok) setSentAtState(new Date());
        }}
      >
        <PortalFormSubmitButton
          idleLabel={sentAtState ? "Resend Quote" : "Send Quote to Client"}
          pendingLabel="Sending…"
          successLabel="Quote sent ✓"
          errorFallback="Failed to send - try again"
          variant="outline"
          size="sm"
          disabled={!canSend}
          className={!canSend ? "cursor-not-allowed opacity-50" : ""}
        />
        {!canSend ? (
          <p className="mt-2 font-body text-xs text-burgundy/55">
            Add at least one line with a description and price, then save, before sending.
          </p>
        ) : (
          <p className="mt-2 font-body text-xs text-burgundy/55">Save first if you changed the quote, then send.</p>
        )}
      </PortalFormWithFlash>
    </div>
  );
}
