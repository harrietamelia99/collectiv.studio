"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { unlockClientWorkspaceAndNotify } from "@/app/portal/actions";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import { ctaButtonClasses } from "@/components/ui/Button";
import type { PortalFormFlash } from "@/lib/portal-form-flash";
import { formatUkMediumDateShortTime } from "@/lib/uk-datetime";

type Props = {
  projectId: string;
  depositRequired: boolean;
  contractSigned: boolean;
  depositPaid: boolean;
  workspaceUnlockedAt: Date | null;
  hubLocked: boolean;
};

export function AgencyUnlockWorkspaceNotifyButton({
  projectId,
  depositRequired,
  contractSigned,
  depositPaid,
  workspaceUnlockedAt,
  hubLocked,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!hubLocked) {
    if (workspaceUnlockedAt) {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-300/90 bg-emerald-50/95 px-4 py-2 font-body text-sm font-semibold text-emerald-950">
          Workspace open ·{" "}
          {formatUkMediumDateShortTime(workspaceUnlockedAt)}
        </span>
      );
    }
    return null;
  }

  const prerequisitesMet = contractSigned && (!depositRequired || depositPaid);
  const disabledTitle = !contractSigned
    ? "Mark the contract as signed first."
    : depositRequired && !depositPaid
      ? "Mark the deposit as paid first."
      : undefined;

  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => unlockClientWorkspaceAndNotify(projectId, fd),
    [projectId],
  );

  if (!prerequisitesMet) {
    return (
      <span className="inline-flex flex-col gap-1">
        <button
          type="button"
          disabled
          title={disabledTitle}
          className={ctaButtonClasses({
            variant: "burgundy",
            size: "sm",
            className: "cursor-not-allowed opacity-45",
          })}
        >
          Unlock workspace &amp; notify client
        </button>
        {disabledTitle ? (
          <span className="max-w-xs font-body text-[11px] leading-snug text-burgundy/50">{disabledTitle}</span>
        ) : null}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}
      >
        Unlock workspace &amp; notify client
      </button>
      <dialog
        ref={dialogRef}
        className="max-w-md rounded-xl border border-zinc-200/90 bg-white p-6 shadow-xl backdrop:bg-black/40"
      >
        <PortalFormWithFlash
          action={action}
          className="space-y-6"
          defaultSuccessMessage="Workspace unlocked ✓"
          onFlash={(f) => {
            if (f.ok) {
              dialogRef.current?.close();
              router.refresh();
            }
          }}
        >
          <p className="m-0 font-body text-sm leading-relaxed text-burgundy/85">
            This will open the client&apos;s full workspace and send them an email letting them know what to do next.
            Ready to proceed?
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={ctaButtonClasses({ variant: "outline", size: "sm" })}
            >
              Cancel
            </button>
            <PortalFormSubmitButton
              idleLabel="Confirm & unlock"
              pendingLabel="Unlocking…"
              successLabel="Workspace unlocked ✓"
              errorFallback="Something went wrong - try again"
              variant="burgundy"
              size="sm"
            />
          </div>
        </PortalFormWithFlash>
      </dialog>
    </>
  );
}
