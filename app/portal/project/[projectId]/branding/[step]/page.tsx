import Link from "next/link";
import type { ReviewAsset } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isAgencyPortalSession } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { normalizePortalKind, visiblePortalSections } from "@/lib/portal-project-kind";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import {
  BRANDING_STEP_SLUGS,
  brandingProofsStepComplete,
  brandingQuestionnaireComplete,
  clientStepEditable,
  streamStepComplete,
  type BrandingStepSlug,
} from "@/lib/portal-workflow";
import { assertClientWorkflowStepAccess } from "@/lib/portal-workflow-guard";
import { isStepReopenedForClient } from "@/lib/portal-workflow-reopen";
import { workflowStepNeighbors } from "@/lib/portal-workflow-nav";
import { InspirationLinksPanel } from "@/components/portal/InspirationLinksPanel";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { InspirationStepContinueHint, WorkflowStepNavRow } from "@/components/portal/WorkflowStepNavRow";
import { FinalPaymentDialog, FinalDesignDownloadLink } from "@/components/portal/FinalDesignPaymentGate";
import { hasLockedFinalDesignFiles, isFinalDesignFileDownloadLocked } from "@/lib/portal-final-files";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { reviewProgressPercent } from "@/lib/portal-progress";
import { formatUkMediumDateShortTime } from "@/lib/uk-datetime";
import { reopenClientWorkflowStep } from "@/app/portal/agency-actions";
import { acknowledgeBrandingFinalDeliverables } from "@/app/portal/actions";
import { ClientReviewAssetSignOffForm } from "@/components/portal/ClientReviewAssetSignOffForm";
import { StudioAddReviewAssetForm } from "@/components/portal/StudioAddReviewAssetForm";
import { PortalBrandingMoodForm } from "@/components/portal/portal-flash-action-forms";
import { BrandQuestionnaireForm, BrandQuestionnaireReadOnly } from "@/components/portal/BrandQuestionnaireForm";
import { ctaButtonClasses } from "@/components/ui/Button";
import { PORTAL_CLIENT_INPUT_CLASS, PortalStepSavedBadge } from "@/components/portal/PortalSectionCard";

type Props = { params: { projectId: string; step: string } };

function isBrandingStep(s: string): s is BrandingStepSlug {
  return (BRANDING_STEP_SLUGS as readonly string[]).includes(s);
}

export default async function BrandingWorkflowStepPage({ params }: Props) {
  const { projectId, step: stepRaw } = params;
  if (!isBrandingStep(stepRaw)) notFound();

  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(projectId, session);

  const studio = isAgencyPortalSession(session);
  const vis = visiblePortalSections(project.portalKind);
  if (!vis.branding && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  const isBrandingPortal = normalizePortalKind(project.portalKind) === "BRANDING";
  const workflowAssets = await prisma.reviewAsset.findMany({
    where: {
      projectId: project.id,
      kind: isBrandingPortal ? { in: ["BRANDING", "GENERAL"] } : "BRANDING",
    },
    orderBy: { createdAt: "asc" },
  });
  const brandingAssets = workflowAssets.filter((a) => a.kind === "BRANDING");
  const generalAssets = workflowAssets.filter((a) => a.kind === "GENERAL");

  assertClientWorkflowStepAccess("branding", stepRaw, project, studio, [], workflowAssets, null);

  const stepEditable = clientStepEditable("branding", stepRaw, project, [], workflowAssets, null, studio);
  const stepComplete = streamStepComplete("branding", stepRaw, project, [], workflowAssets, null);
  const clientVerified = clientHasFullPortalAccess(project);
  const canEdit = !studio && clientVerified && stepEditable;
  const notesSaved = Boolean(project.brandingMoodDescription?.trim());

  const hubHref = `/portal/project/${project.id}`;
  const { prevHref, nextHref } = workflowStepNeighbors("branding", project.id, stepRaw);

  const titleForStep: Record<BrandingStepSlug, string> = {
    inspiration: "Inspiration & Moodboard",
    questionnaire: "Brand Questionnaire",
    proofs: "Proofs & Feedback",
    "final-files": "Final Files",
  };

  return (
    <div>
      <Link
        href={hubHref}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Project hub
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">{titleForStep[stepRaw]}</h1>
      <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-burgundy/70">
        {stepRaw === "inspiration"
          ? "Share links, images, or a short written direction so we can align on mood before the questionnaire."
          : stepRaw === "questionnaire"
            ? "We’ll walk you through six short sections. Your answers save automatically — submit when you’re ready, or come back anytime before then."
            : stepRaw === "proofs"
              ? "Review each deliverable from the studio. Sign off when you’re happy, or leave feedback in Messages if something needs another pass."
              : isBrandingPortal
                ? "Download signed-off branding files and any shared exports the studio adds here. After your last invoice is settled, confirm final payment in the portal to unlock downloads — then tick below when you’ve received everything."
                : "Download signed-off files when your account is ready. Confirm you’ve received the final package when you’re done."}
      </p>

      {stepRaw === "inspiration" ? (
        <div className="mt-10 max-w-none space-y-10 lg:max-w-4xl">
          <InspirationLinksPanel
            key={project.inspirationLinksJson}
            projectId={project.id}
            initialLinks={parseInspirationLinksJson(project.inspirationLinksJson || "[]")}
            canEdit={canEdit}
            pendingVerification={!studio && !clientVerified}
            clientEmphasis={!studio}
            sectionId={null}
            omitDescription
          />
          <div
            className={`rounded-xl border p-6 shadow-sm ${
              notesSaved ? "border-emerald-200/80 bg-emerald-50/35" : "border-zinc-200/90 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-lg text-burgundy">Written direction (optional if you added links)</h2>
              {notesSaved ? <PortalStepSavedBadge /> : null}
            </div>
            <p className="mt-2 font-body text-sm text-burgundy/65">
              If you don’t have links yet, describe the vibe, competitors you like, or what to avoid.
            </p>
            {canEdit ? (
              <PortalBrandingMoodForm projectId={project.id} className="mt-4 flex flex-col gap-3">
                <textarea
                  name="moodDescription"
                  rows={5}
                  defaultValue={project.brandingMoodDescription || ""}
                  className={PORTAL_CLIENT_INPUT_CLASS}
                  maxLength={12000}
                />
                <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}>
                  Save written direction
                </button>
              </PortalBrandingMoodForm>
            ) : (
              <p className="mt-4 whitespace-pre-wrap font-body text-sm text-burgundy/75">
                {project.brandingMoodDescription?.trim() || "—"}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {stepRaw === "questionnaire" ? (
        <QuestionnaireSection
          project={project}
          canEdit={canEdit}
          studio={studio}
          clientVerified={clientVerified}
          complete={brandingQuestionnaireComplete(project)}
        />
      ) : null}

      {stepRaw === "proofs" ? (
        <ProofsSection project={project} studio={studio} assets={brandingAssets} canSignOff={canEdit} />
      ) : null}

      {stepRaw === "final-files" ? (
        <FinalFilesSection
          project={project}
          studio={studio}
          brandingAssets={brandingAssets}
          generalAssets={generalAssets}
          mergeSharedDeliverables={isBrandingPortal}
          clientVerified={clientVerified}
          canEdit={canEdit}
        />
      ) : null}

      {stepRaw === "inspiration" && !studio && clientVerified ? (
        <InspirationStepContinueHint stepComplete={stepComplete} />
      ) : null}
      <WorkflowStepNavRow
        hubHref={hubHref}
        prevHref={prevHref}
        nextHref={nextHref}
        nextDisabled={!stepComplete}
      />
    </div>
  );
}

function QuestionnaireSection({
  project,
  canEdit,
  studio,
  clientVerified,
  complete,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProjectForSession>>>;
  canEdit: boolean;
  studio: boolean;
  clientVerified: boolean;
  complete: boolean;
}) {
  const submitted = Boolean(project.brandingQuestionnaireSubmittedAt);
  const reopened = isStepReopenedForClient("branding", "questionnaire", project.portalWorkflowReopenJson);
  const clientLocked = submitted && !reopened;
  const json = project.brandingQuestionnaireJson || "{}";

  return (
    <div className="mt-8 max-w-3xl space-y-6">
      {!studio && !clientVerified ? (
        <p className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 font-body text-sm text-amber-950/90">
          Once your account is verified, you&apos;ll be able to complete this questionnaire here.
        </p>
      ) : null}

      {studio ? (
        <div className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3 font-body text-sm text-burgundy/75 shadow-sm">
          Studio view — read-only. Use <strong className="font-medium text-burgundy">Reopen for client</strong> if they
          need to change answers after submitting.
        </div>
      ) : null}

      {submitted && !studio ? (
        <div className="space-y-2">
          {reopened ? (
            <p className="rounded-2xl border border-amber-200/90 bg-amber-50/85 px-5 py-4 font-body text-sm leading-relaxed text-amber-950/90">
              The studio has reopened this questionnaire so you can update your answers. When you&apos;re done, submit
              again — we&apos;ll get a fresh notification.
            </p>
          ) : (
            <p className="rounded-2xl border border-emerald-200/90 bg-emerald-50/85 px-5 py-4 font-body text-sm leading-relaxed text-emerald-950/90">
              Thank you — we have everything we need to get started on your brand. We&apos;ll be in touch soon with next
              steps.
            </p>
          )}
          <p className="font-body text-xs text-burgundy/55">
            Submitted{" "}
            {project.brandingQuestionnaireSubmittedAt
              ? formatUkMediumDateShortTime(project.brandingQuestionnaireSubmittedAt)
              : null}
          </p>
        </div>
      ) : null}

      {studio && submitted && !reopened ? (
        <form action={reopenClientWorkflowStep} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="stream" value="branding" />
          <input type="hidden" name="slug" value="questionnaire" />
          <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "min-h-[44px]" })}>
            Reopen for client
          </button>
        </form>
      ) : null}

      {canEdit && !clientLocked ? (
        <BrandQuestionnaireForm projectId={project.id} initialJson={json} />
      ) : (
        <BrandQuestionnaireReadOnly initialJson={json} />
      )}

      {!complete && !studio && clientVerified && canEdit ? (
        <p className="font-body text-xs text-burgundy/55">
          Submit the questionnaire when every section is complete to unlock the next step in your branding project.
        </p>
      ) : null}
    </div>
  );
}

function ProofsSection({
  project,
  studio,
  assets,
  canSignOff,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProjectForSession>>>;
  studio: boolean;
  assets: ReviewAsset[];
  canSignOff: boolean;
}) {
  const pct = reviewProgressPercent(assets, "BRANDING");
  return (
    <>
      <div id="branding-hub-section" className="scroll-mt-28 mt-10 max-w-xl">
        <PhaseProgressBar
          label="Branding proofs"
          percent={pct}
          hint={
            assets.length
              ? `${assets.filter((a) => a.clientSignedOff).length} of ${assets.length} items signed off`
              : "Deliverables will appear here when the studio adds them."
          }
        />
      </div>
      <ul className="mt-12 flex max-w-3xl flex-col gap-8">
        {assets.map((asset) => (
          <li key={asset.id} className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-cc-h4 text-burgundy">{asset.title}</h2>
                  {asset.clientSignedOff ? (
                    <span className="rounded-full border border-burgundy/15 bg-burgundy/[0.06] px-2.5 py-0.5 font-body text-[9px] uppercase tracking-[0.1em] text-burgundy/75">
                      Signed off
                    </span>
                  ) : null}
                </div>
                {asset.notes ? (
                  <p className="mt-3 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/75">
                    {asset.notes}
                  </p>
                ) : null}
                {asset.filePath ? (
                  <FinalDesignDownloadLink
                    href={portalFilePublicUrl(asset.filePath)}
                    locked={isFinalDesignFileDownloadLocked(asset, project, studio)}
                    projectId={project.id}
                  />
                ) : (
                  <p className="mt-4 font-body text-[12px] text-burgundy/50">File coming soon.</p>
                )}
              </div>
              {canSignOff && !asset.clientSignedOff ? (
                <ClientReviewAssetSignOffForm projectId={project.id} assetId={asset.id} className="md:shrink-0" />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {studio ? (
        <section className="mt-16 max-w-lg border-t border-burgundy/15 pt-12">
          <h2 className="font-display text-cc-h3 text-burgundy">Add branding deliverable</h2>
          <StudioAddReviewAssetForm className="mt-6 flex flex-col gap-4">
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="reviewAssetKind" value="BRANDING" />
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Title *</span>
              <input
                name="title"
                type="text"
                required
                className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Notes</span>
              <textarea
                name="notes"
                rows={3}
                className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">File</span>
              <input
                name="file"
                type="file"
                accept=".pdf,.zip,.svg,image/svg+xml,image/png,image/jpeg,image/webp,application/postscript,.ai,.eps"
                className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-cream file:px-4 file:py-2 file:font-body file:text-[10px] file:uppercase file:tracking-[0.1em]"
              />
            </label>
          </StudioAddReviewAssetForm>
        </section>
      ) : null}
    </>
  );
}

function FinalFilesSection({
  project,
  studio,
  brandingAssets,
  generalAssets,
  mergeSharedDeliverables,
  clientVerified,
  canEdit,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProjectForSession>>>;
  studio: boolean;
  brandingAssets: ReviewAsset[];
  generalAssets: ReviewAsset[];
  mergeSharedDeliverables: boolean;
  clientVerified: boolean;
  canEdit: boolean;
}) {
  const paymentScopeAssets = [...brandingAssets, ...generalAssets];
  const showFinalPaymentModal =
    !studio && clientVerified && hasLockedFinalDesignFiles(paymentScopeAssets, project, studio);
  const proofsHref = `/portal/project/${project.id}/branding/proofs`;
  const workflowForProofs = [...brandingAssets, ...generalAssets];
  const proofsStepDone = brandingProofsStepComplete(project, workflowForProofs);
  const generalWithFile = generalAssets.filter((a) => a.filePath);
  const allGeneralSigned =
    generalWithFile.length === 0 || generalWithFile.every((a) => a.clientSignedOff);
  const hasSignedDownloadable = paymentScopeAssets.some((a) => a.filePath && a.clientSignedOff);
  const canShowAcknowledge =
    !studio &&
    clientVerified &&
    canEdit &&
    proofsStepDone &&
    allGeneralSigned &&
    hasSignedDownloadable;

  return (
    <>
      {showFinalPaymentModal ? <FinalPaymentDialog projectId={project.id} autoOpen /> : null}
      <div className="mt-8 max-w-2xl space-y-3">
        <p className="font-body text-sm leading-relaxed text-burgundy/70">
          {mergeSharedDeliverables
            ? "Signed-off identity files and any shared exports (PDFs, SVGs, etc.) appear below. After your last invoice is settled, confirm final payment in the portal to unlock downloads."
            : "Signed-off branding deliverables appear below. After your last invoice is settled, confirm final payment in the portal to unlock downloads."}
        </p>
        {!studio && clientVerified && project.clientAcknowledgedFinalPaymentAt ? (
          <p className="font-body text-[13px] text-burgundy/65">
            <strong className="font-medium text-burgundy/85">Final payment confirmed</strong> — downloads follow the
            same rules as elsewhere in the portal.
          </p>
        ) : null}
      </div>

      <h2 className="mt-12 font-display text-lg tracking-[-0.02em] text-burgundy">Branding files</h2>
      <p className="mt-2 max-w-xl font-body text-sm text-burgundy/65">
        These are the rounds you approved in Proofs & Feedback — downloads respect final payment above.
      </p>
      <ul className="mt-6 flex max-w-3xl flex-col gap-8">
        {brandingAssets.length === 0 ? (
          <li className="rounded-xl border border-dashed border-burgundy/20 bg-burgundy/[0.02] px-5 py-8 text-center font-body text-sm text-burgundy/60">
            No branding proofs yet. The studio will add files for you to sign off on{" "}
            <Link href={proofsHref} className="font-medium text-burgundy underline underline-offset-4">
              Proofs & Feedback
            </Link>
            .
          </li>
        ) : (
          brandingAssets.map((asset) => (
            <li key={asset.id} className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-cc-h4 text-burgundy">{asset.title}</h3>
                  {asset.clientSignedOff ? (
                    <span className="rounded-full border border-burgundy/15 bg-burgundy/[0.06] px-2.5 py-0.5 font-body text-[9px] uppercase tracking-[0.1em] text-burgundy/75">
                      Signed off
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-800/20 bg-amber-50 px-2.5 py-0.5 font-body text-[9px] uppercase tracking-[0.1em] text-amber-950/85">
                      Awaiting sign-off
                    </span>
                  )}
                </div>
                {!asset.clientSignedOff ? (
                  <p className="m-0 font-body text-sm text-burgundy/65">
                    Sign this off on{" "}
                    <Link href={proofsHref} className="font-medium text-burgundy underline underline-offset-4">
                      Proofs & Feedback
                    </Link>{" "}
                    first.
                  </p>
                ) : null}
                {asset.clientSignedOff && asset.filePath ? (
                  <FinalDesignDownloadLink
                    href={portalFilePublicUrl(asset.filePath)}
                    locked={isFinalDesignFileDownloadLocked(asset, project, studio)}
                    projectId={project.id}
                  />
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>

      {mergeSharedDeliverables ? (
        <>
          <h2 className="mt-16 font-display text-lg tracking-[-0.02em] text-burgundy">Shared files</h2>
          <p className="mt-2 max-w-xl font-body text-sm text-burgundy/65">
            Briefs, mock-ups, and exports the studio shares for sign-off — same download rules as your branding files
            above.
          </p>
          <ul className="mt-6 flex max-w-3xl flex-col gap-8">
            {generalAssets.map((asset) => (
              <li key={asset.id} className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-cc-h4 text-burgundy">{asset.title}</h3>
                      {asset.clientSignedOff ? (
                        <span className="rounded-full border border-burgundy/15 bg-burgundy/[0.06] px-2.5 py-0.5 font-body text-[9px] uppercase tracking-[0.1em] text-burgundy/75">
                          Signed off
                        </span>
                      ) : null}
                    </div>
                    {asset.notes ? (
                      <p className="mt-3 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/75">
                        {asset.notes}
                      </p>
                    ) : null}
                    {asset.filePath ? (
                      <FinalDesignDownloadLink
                        href={portalFilePublicUrl(asset.filePath)}
                        locked={isFinalDesignFileDownloadLocked(asset, project, studio)}
                        projectId={project.id}
                      />
                    ) : (
                      <p className="mt-4 font-body text-[12px] text-burgundy/50">File coming soon.</p>
                    )}
                  </div>
                  {!studio && !asset.clientSignedOff ? (
                    <ClientReviewAssetSignOffForm projectId={project.id} assetId={asset.id} className="md:shrink-0" />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {studio ? (
            <section className="mt-12 max-w-lg border-t border-burgundy/15 pt-10">
              <h3 className="font-display text-cc-h3 text-burgundy">Upload shared file for client</h3>
              <p className="mt-2 max-w-xl font-body text-sm text-burgundy/65">
                Adds a shared deliverable (PDF, export, etc.) your client signs off here — not an identity proof round.
              </p>
              <StudioAddReviewAssetForm
                className="mt-6 flex max-w-lg flex-col gap-4"
                idleLabel="Add shared file"
                successLabel="File uploaded ✓"
              >
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="reviewAssetKind" value="GENERAL" />
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Title *</span>
                  <input
                    name="title"
                    type="text"
                    required
                    className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Notes</span>
                  <textarea
                    name="notes"
                    rows={3}
                    className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">File</span>
                  <input
                    name="file"
                    type="file"
                    accept=".pdf,.zip,.svg,image/svg+xml,image/png,image/jpeg,image/webp,application/postscript,.ai,.eps"
                    className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-cream file:px-4 file:py-2 file:font-body file:text-[10px] file:uppercase file:tracking-[0.1em]"
                  />
                </label>
              </StudioAddReviewAssetForm>
            </section>
          ) : null}
        </>
      ) : null}

      {canShowAcknowledge ? (
        <form action={acknowledgeBrandingFinalDeliverables.bind(null, project.id)} className="mt-10">
          <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}>
            {project.brandingFinalDeliverablesAcknowledgedAt
              ? "Acknowledgment recorded — submit again if the studio asks"
              : mergeSharedDeliverables
                ? "I confirm I’ve received my final branding files and shared downloads"
                : "I confirm I’ve received the final branding files"}
          </button>
        </form>
      ) : null}
      {project.brandingFinalDeliverablesAcknowledgedAt ? (
        <p className="mt-4 font-body text-xs text-burgundy/60">
          Acknowledged{" "}
          {formatUkMediumDateShortTime(project.brandingFinalDeliverablesAcknowledgedAt)}
        </p>
      ) : null}
    </>
  );
}
