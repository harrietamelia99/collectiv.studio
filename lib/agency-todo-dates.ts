/** Calendar day boundaries for agency dashboard (due today, completed today). */
export const AGENCY_PORTAL_TIMEZONE = process.env.PORTAL_AGENCY_TZ?.trim() || "Europe/London";

export function agencyDateYmd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AGENCY_PORTAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
