"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addManualAgencyTodo } from "@/app/portal/agency-actions";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";

export function AgencyDashboardAddTodoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        startTransition(async () => {
          const fd = new FormData(form);
          await addManualAgencyTodo(fd);
          form.reset();
          router.refresh();
        });
      }}
    >
      <label className="sm:col-span-2 block font-body text-sm text-burgundy/65">
        What is it?
        <input
          name="title"
          required
          maxLength={200}
          disabled={pending}
          className={`${PORTAL_CLIENT_INPUT_CLASS} mt-1.5`}
        />
      </label>
      <label className="block font-body text-sm text-burgundy/65">
        Due (optional)
        <input type="date" name="dueDate" disabled={pending} className={`${PORTAL_CLIENT_INPUT_CLASS} mt-1.5`} />
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-burgundy px-4 py-2.5 font-body text-sm font-semibold text-cream shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add to list"}
        </button>
      </div>
      <label className="sm:col-span-2 lg:col-span-4 block font-body text-sm text-burgundy/65">
        Extra detail (optional)
        <textarea
          name="body"
          rows={2}
          maxLength={8000}
          disabled={pending}
          className={`${PORTAL_CLIENT_INPUT_CLASS} mt-1.5`}
        />
      </label>
    </form>
  );
}
