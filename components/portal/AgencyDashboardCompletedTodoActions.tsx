"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  permanentlyDeleteCompletedAgencyTodo,
  reopenAgencyTodo,
} from "@/app/portal/agency-actions";
import { ctaButtonClasses } from "@/components/ui/Button";

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

type Props = { todoId: string };

export function AgencyDashboardCompletedTodoActions({ todoId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const putBack = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("todoId", todoId);
      await reopenAgencyTodo(fd);
      router.refresh();
    });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("todoId", todoId);
      await permanentlyDeleteCompletedAgencyTodo(fd);
      setConfirming(false);
      router.refresh();
    });
  };

  return (
    <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      {confirming ? (
        <div className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-2 rounded-lg border border-rose-200/80 bg-rose-50/80 px-3 py-2 font-body text-xs text-rose-950/90">
          <span className="font-medium">Delete permanently?</span>
          <button
            type="button"
            disabled={pending}
            onClick={confirmDelete}
            className={ctaButtonClasses({
              variant: "burgundy",
              size: "sm",
              className: "min-h-[36px] px-3 py-1.5 text-[11px]",
            })}
          >
            {pending ? "…" : "Confirm"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="min-h-[36px] rounded-full border border-zinc-300 bg-white px-3 py-1.5 font-body text-[11px] font-medium text-burgundy hover:bg-zinc-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={putBack}
            className="rounded-full border border-burgundy bg-white px-3 py-1.5 font-body text-xs font-medium text-burgundy transition-colors hover:bg-burgundy hover:text-cream disabled:opacity-50"
          >
            {pending ? "…" : "Put back"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(true)}
            aria-label="Delete this completed task permanently"
            title="Delete permanently"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-burgundy transition-colors hover:border-burgundy/35 hover:bg-burgundy/[0.06] disabled:opacity-50"
          >
            <AgencyTodoRemoveIcon />
          </button>
        </div>
      )}
    </div>
  );
}
