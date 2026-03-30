import { Bell } from "lucide-react";

/** Sample alerts for layout / bell testing when the database has no rows or is offline. */
export function ClientNotificationsDemoList() {
  return (
    <div
      className="mb-8 rounded-xl border border-sky-200/80 bg-sky-50/50 px-4 py-3 font-body text-sm leading-relaxed text-burgundy"
      role="note"
    >
      <p className="m-0 flex items-start gap-2 font-medium text-burgundy">
        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-sky-800/70" aria-hidden />
        <span>
          Sample alerts below are for layout only. With a connected database, real studio updates replace these and Mark
          read will persist.
        </span>
      </p>
    </div>
  );
}
