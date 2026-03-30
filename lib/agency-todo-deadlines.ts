/** Due datetime for agency tasks: end of the calendar day UTC, `daysFromNow` after `from`. */
export function agencyTodoDueInCalendarDays(daysFromNow: number, from: Date = new Date()): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}
