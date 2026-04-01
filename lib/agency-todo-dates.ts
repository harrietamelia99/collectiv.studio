import { UK_PORTAL_TIMEZONE } from "@/lib/uk-datetime";

/** Calendar day boundaries for agency dashboard (due today, completed today). */
export const AGENCY_PORTAL_TIMEZONE = UK_PORTAL_TIMEZONE;

export function agencyDateYmd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AGENCY_PORTAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
