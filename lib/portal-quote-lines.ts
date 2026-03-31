export type QuoteLineRow = { label: string; detail: string; amount: string };
/** Alias for UI components */
export type QuoteLine = QuoteLineRow;

import type { ClientPortalAccessFields } from "@/lib/portal-client-full-access";

/** Studio may create and send quotes before the client hub unlocks (onboarding). */
export function quoteAllowedForProject(project: ClientPortalAccessFields & { portalKind: string }): boolean {
  void project;
  return true;
}

export function parseQuoteLineItemsJson(raw: string): QuoteLineRow[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: QuoteLineRow[] = [];
    for (const row of v) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const label = typeof o.label === "string" ? o.label.trim() : "";
      const amount = typeof o.amount === "string" ? o.amount.trim() : "";
      const detail = typeof o.detail === "string" ? o.detail.trim() : "";
      if (label && amount) out.push({ label, detail, amount });
    }
    return out;
  } catch {
    return [];
  }
}

/** Parse a user-entered amount like "£1,200", "1200", "1200.50" into a number, or null if not parseable. */
export function parsePoundAmountString(raw: string): number | null {
  const s = raw.replace(/£/g, "").replace(/,/g, "").trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function sumQuoteLinePounds(lines: QuoteLineRow[]): number {
  return lines.reduce((acc, line) => acc + (parsePoundAmountString(line.amount) ?? 0), 0);
}

export function formatPoundsTotal(n: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

/** Format a stored line amount (e.g. "1300", "£1,200") like the quote total: £1,300.00 */
export function formatQuoteLineAmountForDisplay(raw: string): string {
  const n = parsePoundAmountString(raw);
  if (n === null) return raw.trim() || "—";
  return formatPoundsTotal(n);
}
