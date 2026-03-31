"use client";

import { useMemo, useRef } from "react";
import { markClientContractSigned } from "@/app/portal/actions";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import { ctaButtonClasses } from "@/components/ui/Button";
import type { PortalFormFlash } from "@/lib/portal-form-flash";

type Props = {
  projectId: string;
  contractSigned: boolean;
};

export function AgencyMarkContractSignedForm({ projectId, contractSigned }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => markClientContractSigned(fd),
    [],
  );

  if (contractSigned) {
    return (
      <PortalFormWithFlash action={action}>
        <input type="hidden" name="projectId" value={projectId} />
        <PortalFormSubmitButton
          idleLabel="Clear contract signed"
          pendingLabel="Clearing…"
          successLabel="Contract signed status cleared ✓"
          errorFallback="Couldn’t update contract status. Try again."
          variant="outline"
          size="sm"
        />
      </PortalFormWithFlash>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={ctaButtonClasses({ variant: "outline", size: "sm" })}
      >
        Mark contract signed
      </button>
      <dialog
        ref={dialogRef}
        className="max-w-md rounded-xl border border-zinc-200/90 bg-white p-6 shadow-xl backdrop:bg-black/40"
      >
        <PortalFormWithFlash action={action}>
          <input type="hidden" name="projectId" value={projectId} />
          <p className="m-0 font-body text-sm leading-relaxed text-burgundy/85">
            Are you sure? This will mark the contract as signed on behalf of the client.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={ctaButtonClasses({ variant: "outline", size: "sm" })}
            >
              Cancel
            </button>
            <PortalFormSubmitButton
              idleLabel="Confirm"
              pendingLabel="Marking…"
              successLabel="Contract marked signed ✓"
              errorFallback="Couldn’t update contract status. Try again."
              variant="burgundy"
              size="sm"
              onClick={() => dialogRef.current?.close()}
            />
          </div>
        </PortalFormWithFlash>
      </dialog>
    </>
  );
}
