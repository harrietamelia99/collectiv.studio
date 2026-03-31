"use client";

import { useEffect, useMemo, useRef } from "react";
import { acknowledgeFinalDesignPayment } from "@/app/portal/actions";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import { ctaButtonClasses } from "@/components/ui/Button";
import type { PortalFormFlash } from "@/lib/portal-form-flash";

function openFinalPaymentDialog(projectId: string) {
  const el = document.getElementById(`final-payment-dialog-${projectId}`);
  if (el instanceof HTMLDialogElement) el.showModal();
}

export function FinalPaymentDialog({
  projectId,
  autoOpen,
}: {
  projectId: string;
  /** Open modal when the page loads (client has locked final files). */
  autoOpen: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => acknowledgeFinalDesignPayment(fd),
    [],
  );

  useEffect(() => {
    if (autoOpen && ref.current && !ref.current.open) {
      ref.current.showModal();
    }
  }, [autoOpen]);

  return (
    <dialog
      ref={ref}
      id={`final-payment-dialog-${projectId}`}
      className="w-[calc(100%-2rem)] max-w-md rounded-cc-card border border-burgundy/18 bg-cream p-6 text-burgundy shadow-2xl backdrop:bg-black/45 open:backdrop:backdrop-blur-[2px]"
    >
      <PortalFormWithFlash action={action} className="flex flex-col">
        <input type="hidden" name="projectId" value={projectId} />
        <h2 className="font-display text-xl tracking-[-0.02em] text-burgundy">Access your final files</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-burgundy/75">
          Final design files are available once your last payment has cleared. Confirm below to unlock downloads for
          everything you&apos;ve already signed off.
        </p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-burgundy/10 bg-white/50 px-3 py-3 font-body text-sm text-burgundy/85">
          <input type="checkbox" name="confirm" required className="mt-0.5 h-4 w-4 shrink-0 accent-burgundy" />
          <span>I confirm that my final payment for this project has been made.</span>
        </label>
        <p className="mt-3 font-body text-[11px] leading-relaxed text-burgundy/50">
          If you need the invoice again or aren&apos;t sure what&apos;s due, use the project messages to talk to the
          studio before ticking this box.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className={ctaButtonClasses({ variant: "outline", size: "sm", className: "px-4" })}
            onClick={() => ref.current?.close()}
          >
            Not yet
          </button>
          <PortalFormSubmitButton
            idleLabel="Unlock downloads"
            pendingLabel="Confirming…"
            successLabel="Confirmed — downloads unlocked ✓"
            errorFallback="Couldn’t confirm. Try again."
            variant="burgundy"
            size="sm"
            className="px-4"
          />
        </div>
      </PortalFormWithFlash>
    </dialog>
  );
}

export function FinalDesignDownloadLink({
  href,
  locked,
  projectId,
}: {
  href: string;
  locked: boolean;
  projectId: string;
}) {
  if (!locked) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block font-body text-[11px] uppercase tracking-[0.1em] text-burgundy underline underline-offset-4"
      >
        Download / view file
      </a>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-800/20 bg-amber-50/50 px-4 py-3">
      <p className="m-0 font-body text-sm font-medium text-amber-950">Final file — payment confirmation required</p>
      <p className="mt-1 font-body text-[13px] leading-relaxed text-burgundy/75">
        Access your files once final payment has been made. Open the confirmation dialog to unlock.
      </p>
      <button
        type="button"
        onClick={() => openFinalPaymentDialog(projectId)}
        className="mt-3 font-body text-[11px] uppercase tracking-[0.12em] text-burgundy underline underline-offset-4"
      >
        Confirm final payment to access →
      </button>
    </div>
  );
}
