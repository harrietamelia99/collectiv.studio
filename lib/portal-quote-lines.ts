export type QuoteLineRow = { label: string; detail: string; amount: string };
/** Alias for UI components */
export type QuoteLine = QuoteLineRow;

import { clientHasFullPortalAccess, type ClientPortalAccessFields } from "@/lib/portal-client-full-access";

export function quoteAllowedForProject(project: ClientPortalAccessFields & { portalKind: string }): boolean {
  if (project.portalKind === "WEBSITE" || project.portalKind === "MULTI") {
    return clientHasFullPortalAccess(project);
  }
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
