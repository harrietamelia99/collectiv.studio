import { UK_PORTAL_TIMEZONE } from "@/lib/uk-datetime";

/** Shared date label for calendar posts (ISO strings from the API / props). UK time (GMT/BST). */
export function formatContentCalendarWhen(iso: string | null, opts?: { withTime?: boolean }): string {
  if (!iso) return "Date TBC";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBC";
  const tz = { timeZone: UK_PORTAL_TIMEZONE };
  if (opts?.withTime) {
    return d.toLocaleString("en-GB", {
      ...tz,
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-GB", {
    ...tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
