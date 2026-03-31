"use client";

import { useMemo, type ReactNode } from "react";
import {
  markProjectComplete,
  markStudioDepositReceived,
  resetClientFinalPaymentAcknowledgment,
  setPortalKind,
  setProjectPaymentStatus,
} from "@/app/portal/actions";
import {
  addProjectInternalNote,
  saveProjectContractTerms,
  toggleStudioWebsiteLiveConfirmed,
  toggleStudioWorkflowStepReviewed,
  updateProjectAssignedStudioAdmin,
} from "@/app/portal/agency-actions";
import { PortalFormSubmitButton, PendingSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { PAYMENT_STATUSES, paymentStatusStudioLabel } from "@/lib/portal-payment-status";
import {
  PORTAL_KINDS_STUDIO_ASSIGNABLE,
  clientVisibleAreasSummary,
  portalKindLabel,
} from "@/lib/portal-project-kind";
import { HubIconSettings } from "@/components/portal/ProjectHubIcons";
import type { PortalFormFlash } from "@/lib/portal-form-flash";
import type { Project } from "@prisma/client";

export function AgencySaveAssigneeForm({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => updateProjectAssignedStudioAdmin(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className="space-y-2">
      {children}
      <PortalFormSubmitButton
        idleLabel="Save assignee"
        pendingLabel="Saving…"
        successLabel="Assignee saved ✓"
        errorFallback="Couldn’t save assignee. Try again."
        variant="burgundy"
        className="w-full"
      />
    </PortalFormWithFlash>
  );
}

export function AgencyPortalKindForm({
  projectId,
  project,
}: {
  projectId: string;
  project: Pick<Project, "portalKind">;
}) {
  return (
    <form action={setPortalKind.bind(null, projectId)} className="space-y-2 border-t border-zinc-100 pt-4">
      <label className="flex items-center gap-2 font-body text-xs font-medium text-burgundy/70">
        <HubIconSettings className="h-4 w-4 text-burgundy/50" aria-hidden />
        Portal layout
      </label>
      <select name="portalKind" defaultValue={project.portalKind} className={PORTAL_CLIENT_INPUT_CLASS}>
        {project.portalKind === "ONE_OFF" ? (
          <option value="ONE_OFF">{portalKindLabel("ONE_OFF")} (legacy)</option>
        ) : null}
        {PORTAL_KINDS_STUDIO_ASSIGNABLE.map((k) => (
          <option key={k} value={k}>
            {portalKindLabel(k)}
          </option>
        ))}
      </select>
      <p className="font-body text-[11px] leading-relaxed text-burgundy/55">
        Client sees {clientVisibleAreasSummary(project.portalKind)}.
      </p>
      <PendingSubmitButton
        idleLabel="Save type"
        pendingLabel="Saving…"
        variant="outline"
        className="w-full"
      />
    </form>
  );
}

export function AgencySaveContractTermsForm({ projectId, defaultText }: { projectId: string; defaultText: string }) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => saveProjectContractTerms(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className="mt-4 space-y-3">
      <textarea
        name="contractTermsText"
        rows={14}
        defaultValue={defaultText}
        className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[12rem] font-body text-sm leading-relaxed`}
        placeholder="Paste or write the full service agreement for this project…"
      />
      <PortalFormSubmitButton
        idleLabel="Save contract text"
        pendingLabel="Saving…"
        successLabel="Contract text saved ✓"
        errorFallback="Couldn’t save contract text. Try again."
        variant="burgundy"
        size="sm"
      />
    </PortalFormWithFlash>
  );
}

export function AgencyMarkDepositForm({
  projectId,
  depositPaid,
}: {
  projectId: string;
  depositPaid: boolean;
}) {
  const action = useMemo(() => async (_p: PortalFormFlash | null, fd: FormData) => markStudioDepositReceived(fd), []);
  return (
    <PortalFormWithFlash action={action}>
      <input type="hidden" name="projectId" value={projectId} />
      <PortalFormSubmitButton
        idleLabel={depositPaid ? "Clear deposit paid" : "Mark deposit paid"}
        pendingLabel={depositPaid ? "Clearing…" : "Marking paid…"}
        successLabel={depositPaid ? "Deposit status cleared ✓" : "Deposit marked paid ✓"}
        errorFallback="Couldn’t update deposit. Try again."
        variant="outline"
        size="sm"
      />
    </PortalFormWithFlash>
  );
}

export function AgencySubscriptionPaymentForm({
  projectId,
  defaultStatus,
  defaultNote,
}: {
  projectId: string;
  defaultStatus: string;
  defaultNote: string;
}) {
  return (
    <form action={setProjectPaymentStatus} className="mt-6 flex max-w-xl flex-col gap-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="flex flex-col gap-2">
        <span className="font-body text-sm font-medium text-burgundy/80">Status</span>
        <select name="paymentStatus" defaultValue={defaultStatus} className={PORTAL_CLIENT_INPUT_CLASS}>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {paymentStatusStudioLabel(s)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-body text-sm font-medium text-burgundy/80">Note to client (optional)</span>
        <textarea
          name="paymentNoteForClient"
          rows={2}
          maxLength={500}
          defaultValue={defaultNote}
          className={PORTAL_CLIENT_INPUT_CLASS}
        />
      </label>
      <PendingSubmitButton
        idleLabel="Save subscription & payment status"
        pendingLabel="Saving…"
        variant="burgundy"
        size="sm"
        className="w-fit"
      />
    </form>
  );
}

export function AgencyInternalNoteForm({ projectId }: { projectId: string }) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => addProjectInternalNote(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className="mt-6 space-y-3 border-t border-zinc-200 pt-6">
      <label className="block font-body text-sm font-medium text-zinc-700">Add a note</label>
      <textarea name="body" rows={3} className={PORTAL_CLIENT_INPUT_CLASS} placeholder="Handover, context, reminders…" />
      <PortalFormSubmitButton
        idleLabel="Save internal note"
        pendingLabel="Saving…"
        successLabel="Internal note saved ✓"
        errorFallback="Couldn’t save note. Try again."
        variant="burgundy"
        size="sm"
      />
    </PortalFormWithFlash>
  );
}

export function AgencyMarkProjectCompleteForm({ projectId }: { projectId: string }) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => markProjectComplete(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action}>
      <PortalFormSubmitButton
        idleLabel="Mark project complete (client feedback form)"
        pendingLabel="Marking complete…"
        successLabel="Project marked complete ✓"
        errorFallback="Couldn’t mark complete. Try again."
        variant="outline"
        size="sm"
      />
    </PortalFormWithFlash>
  );
}

export function AgencyResetFinalPaymentForm({ projectId }: { projectId: string }) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => resetClientFinalPaymentAcknowledgment(fd),
    [],
  );
  return (
    <PortalFormWithFlash action={action}>
      <input type="hidden" name="projectId" value={projectId} />
      <PortalFormSubmitButton
        idleLabel="Reset confirmation"
        pendingLabel="Resetting…"
        successLabel="Payment confirmation reset ✓"
        errorFallback="Couldn’t reset. Try again."
        variant="outline"
        size="sm"
      />
    </PortalFormWithFlash>
  );
}

export function AgencyMarkStepReviewedForm({
  projectId,
  stepKey,
  reviewed,
}: {
  projectId: string;
  stepKey: string;
  reviewed: boolean;
}) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => toggleStudioWorkflowStepReviewed(fd),
    [],
  );
  return (
    <PortalFormWithFlash action={action}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="stepKey" value={stepKey} />
      <PortalFormSubmitButton
        idleLabel={reviewed ? "Clear studio review flag" : "Mark reviewed"}
        pendingLabel={reviewed ? "Clearing…" : "Marking reviewed…"}
        successLabel={reviewed ? "Review flag cleared ✓" : "Marked reviewed ✓"}
        errorFallback="Couldn’t update review flag. Try again."
        variant="outline"
        size="sm"
        className="w-full whitespace-nowrap"
      />
    </PortalFormWithFlash>
  );
}

export function AgencyMarkSiteLiveForm({
  projectId,
  confirmed,
}: {
  projectId: string;
  confirmed: boolean;
}) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => toggleStudioWebsiteLiveConfirmed(fd),
    [],
  );
  return (
    <PortalFormWithFlash action={action}>
      <input type="hidden" name="projectId" value={projectId} />
      <PortalFormSubmitButton
        idleLabel={confirmed ? "Undo site live confirmation" : "Mark site live (studio)"}
        pendingLabel={confirmed ? "Undoing…" : "Marking live…"}
        successLabel={confirmed ? "Site live confirmation cleared ✓" : "Site marked live ✓"}
        errorFallback="Couldn’t update site status. Try again."
        variant="outline"
        size="sm"
        className="w-full whitespace-nowrap"
      />
    </PortalFormWithFlash>
  );
}
