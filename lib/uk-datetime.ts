/**
 * UK civil time (GMT / BST) for portal UI and emails.
 * Node/Vercel default locale formatting uses UTC unless `timeZone` is set — that reads as “an hour wrong” for UK users in summer.
 */
export const UK_PORTAL_TIMEZONE =
  process.env.PORTAL_UK_TIMEZONE?.trim() || process.env.PORTAL_AGENCY_TZ?.trim() || "Europe/London";

function asDate(input: Date | string | number): Date | null {
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatUkDateTime(
  input: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  if (input == null) return "—";
  const d = asDate(input);
  if (!d) return "—";
  return d.toLocaleString("en-GB", { timeZone: UK_PORTAL_TIMEZONE, ...options });
}

export function formatUkDate(
  input: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  if (input == null) return "—";
  const d = asDate(input);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { timeZone: UK_PORTAL_TIMEZONE, ...options });
}

export function formatUkMediumDateShortTime(input: Date | string | number | null | undefined): string {
  return formatUkDateTime(input, { dateStyle: "medium", timeStyle: "short" });
}

export function formatUkLongDateShortTime(input: Date | string | number | null | undefined): string {
  return formatUkDateTime(input, { dateStyle: "long", timeStyle: "short" });
}

export function formatUkLongDate(input: Date | string | number | null | undefined): string {
  return formatUkDate(input, { dateStyle: "long" });
}

export function formatUkDateDayMonthLongYear(input: Date | string | number | null | undefined): string {
  return formatUkDate(input, { day: "numeric", month: "long", year: "numeric" });
}

export function formatUkMessageThreadTimestamp(input: Date | string | number | null | undefined): string {
  return formatUkDateTime(input, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUkActivityTimestamp(input: Date | string | number | null | undefined): string {
  return formatUkDateTime(input, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatUkTeamChatTimestamp(input: Date | string | number | null | undefined): string {
  return formatUkDateTime(input, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Month banner for a calendar grid (year + zero-based month index). */
export function formatUkYearMonthLabel(year: number, monthIndexZeroBased: number): string {
  return new Date(Date.UTC(year, monthIndexZeroBased, 15, 12, 0, 0)).toLocaleDateString("en-GB", {
    timeZone: UK_PORTAL_TIMEZONE,
    month: "long",
    year: "numeric",
  });
}

/** “March 2026” for an arbitrary Date instant in the UK wall calendar. */
export function formatUkMonthYearFromDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    timeZone: UK_PORTAL_TIMEZONE,
    month: "long",
    year: "numeric",
  });
}

export function formatUkWeekdayDayMonthLong(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    timeZone: UK_PORTAL_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Agenda row label for a calendar day (y, month 0–11, day). */
export function formatUkAgendaDayLabel(y: number, monthIndexZeroBased: number, day: number): string {
  return new Date(Date.UTC(y, monthIndexZeroBased, day, 12, 0, 0)).toLocaleDateString("en-GB", {
    timeZone: UK_PORTAL_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
