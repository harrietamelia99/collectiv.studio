"use client";

import { useState } from "react";
import { deleteAgencyTodo } from "@/app/portal/agency-actions";

function AgencyTodoRemoveIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  todoId: string;
  isAutoReminder: boolean;
  compact?: boolean;
};

export function AgencyTodoDeleteConfirmButton({ todoId, isAutoReminder, compact }: Props) {
  const [confirming, setConfirming] = useState(false);
  const removeLabel = isAutoReminder ? "Dismiss reminder for 7 days" : "Remove task";
  const removeTitle = isAutoReminder
    ? "Hide this auto-reminder for 7 days (it can return if the project still needs it)"
    : "Remove task";

  const iconBtn =
    "inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white text-burgundy transition-colors hover:border-burgundy/35 hover:bg-burgundy/[0.06]";
  const size = compact ? "h-7 w-7" : "h-9 w-9";

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={removeLabel}
        title={removeTitle}
        className={`${iconBtn} ${size} shadow-sm`}
      >
        <AgencyTodoRemoveIcon />
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full border border-zinc-300 bg-white px-2.5 py-1 font-body text-[11px] font-medium text-burgundy hover:border-burgundy/40"
      >
        Cancel
      </button>
      <form action={deleteAgencyTodo} className="inline">
        <input type="hidden" name="todoId" value={todoId} />
        <button
          type="submit"
          aria-label={removeLabel}
          title={removeTitle}
          className="rounded-full bg-burgundy px-2.5 py-1 font-body text-[11px] font-semibold text-cream shadow-sm hover:opacity-90"
        >
          {isAutoReminder ? "Dismiss" : "Delete"}
        </button>
      </form>
    </span>
  );
}
