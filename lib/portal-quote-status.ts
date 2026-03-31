export const QUOTE_STATUS_PENDING = "PENDING" as const;
export const QUOTE_STATUS_ACCEPTED = "ACCEPTED" as const;
export const QUOTE_STATUS_DECLINED = "DECLINED" as const;

export type QuoteClientStatus =
  | typeof QUOTE_STATUS_PENDING
  | typeof QUOTE_STATUS_ACCEPTED
  | typeof QUOTE_STATUS_DECLINED;

export function normalizeQuoteClientStatus(raw: string | null | undefined): QuoteClientStatus {
  if (raw === QUOTE_STATUS_ACCEPTED || raw === QUOTE_STATUS_DECLINED) return raw;
  return QUOTE_STATUS_PENDING;
}
