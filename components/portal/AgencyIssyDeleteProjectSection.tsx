"use client";

import { useRef, useState } from "react";
import { deleteStudioProjectByIssy } from "@/app/portal/agency-actions";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";

const destructiveBtn =
  "inline-flex min-h-[40px] items-center justify-center rounded-lg border border-rose-300/90 bg-rose-50 px-4 py-2 font-body text-sm font-medium text-rose-900 shadow-sm transition-colors hover:border-rose-400 hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400";

const destructivePrimary =
  "inline-flex min-h-[40px] items-center justify-center rounded-lg border border-rose-400 bg-rose-600 px-4 py-2 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40";

type Props = {
  projectId: string;
  projectName: string;
};

export function AgencyIssyDeleteProjectSection({ projectId, projectName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");

  const exactMatch = typed.trim() === projectName.trim();

  return (
    <div className="mt-10 border-t border-rose-200/70 pt-8">
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-800/70">Danger zone</p>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={`${destructiveBtn} mt-3`}>
        Delete project
      </button>

      <dialog
        ref={dialogRef}
        className="max-w-lg rounded-xl border border-rose-200/90 bg-white p-6 shadow-xl backdrop:bg-black/40"
        onClose={() => setTyped("")}
      >
        <h3 className="font-display text-lg text-rose-950">Delete project</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-rose-950/85">
          Are you sure you want to delete this project? This will permanently remove all project data, steps, messages,
          files and client access. This cannot be undone.
        </p>
        <p className="mt-4 font-body text-xs font-medium text-rose-900/80">
          Type the project name exactly to confirm: <span className="font-semibold">{projectName}</span>
        </p>
        <form action={deleteStudioProjectByIssy} className="mt-3 space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input
            name="confirmName"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className={`${PORTAL_CLIENT_INPUT_CLASS} border-rose-200/80 font-body text-sm`}
            placeholder="Project name"
            aria-label="Type project name to confirm deletion"
          />
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setTyped("");
                dialogRef.current?.close();
              }}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 font-body text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={!exactMatch} className={destructivePrimary}>
              Delete permanently
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
