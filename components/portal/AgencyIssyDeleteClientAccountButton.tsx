"use client";

import { useRef, useState } from "react";
import { deleteStudioClientTestAccountByIssy } from "@/app/portal/agency-actions";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";

const linkBtn =
  "font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-rose-700/90 underline decoration-rose-300 underline-offset-2 hover:text-rose-900 hover:decoration-rose-500";

const destructivePrimary =
  "inline-flex min-h-[40px] items-center justify-center rounded-lg border border-rose-400 bg-rose-600 px-4 py-2 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40";

type Props = {
  clientUserId: string;
  clientEmail: string;
};

export function AgencyIssyDeleteClientAccountButton({ clientUserId, clientEmail }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const expected = clientEmail.trim().toLowerCase();
  const exactMatch = typed.trim().toLowerCase() === expected;

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={linkBtn}>
        Delete account
      </button>
      <dialog
        ref={dialogRef}
        className="max-w-lg rounded-xl border border-rose-200/90 bg-white p-6 shadow-xl backdrop:bg-black/40"
        onClose={() => setTyped("")}
      >
        <h3 className="font-display text-lg text-rose-950">Delete client account</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-rose-950/85">
          Are you sure you want to delete this client account? This will permanently remove the account and all projects,
          messages, files, and portal data linked to it. This cannot be undone.
        </p>
        <p className="mt-4 font-body text-xs font-medium text-rose-900/80">
          Type the account email exactly to confirm:
        </p>
        <p className="mt-1 break-all font-mono text-[13px] text-rose-950">{clientEmail}</p>
        <form action={deleteStudioClientTestAccountByIssy} className="mt-4 space-y-4">
          <input type="hidden" name="clientUserId" value={clientUserId} />
          <input
            name="confirmEmail"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            type="email"
            className={`${PORTAL_CLIENT_INPUT_CLASS} border-rose-200/80 font-body text-sm`}
            placeholder="Email address"
            aria-label="Type client email to confirm account deletion"
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
              Delete account permanently
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
