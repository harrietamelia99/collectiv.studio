/** Shared date label for calendar posts (ISO strings from the API / props). Uses the viewer's local timezone. */
export function formatContentCalendarWhen(iso: string | null, opts?: { withTime?: boolean }): string {
  if (!iso) return "Date TBC";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBC";
  if (opts?.withTime) {
    return d.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
