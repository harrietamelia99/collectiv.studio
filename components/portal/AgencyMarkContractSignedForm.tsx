"use client";

import { useRef } from "react";
import { markClientContractSigned } from "@/app/portal/actions";
import { ctaButtonClasses } from "@/components/ui/Button";

type Props = {
  projectId: string;
  contractSigned: boolean;
};

export function AgencyMarkContractSignedForm({ projectId, contractSigned }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (contractSigned) {
    return (
      <form action={markClientContractSigned}>
        <input type="hidden" name="projectId" value={projectId} />
        <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
          Clear contract signed
        </button>
      </form>
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
        <form action={markClientContractSigned}>
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
            <button
              type="submit"
              onClick={() => dialogRef.current?.close()}
              className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}
            >
              Confirm
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
