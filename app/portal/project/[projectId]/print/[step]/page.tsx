import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isStudioUser } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { normalizePortalKind } from "@/lib/portal-project-kind";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import {
  clientStepEditable,
  PRINT_STEP_SLUGS,
  streamStepComplete,
  type PrintStepSlug,
} from "@/lib/portal-workflow";
import { assertClientWorkflowStepAccess } from "@/lib/portal-workflow-guard";
import { workflowStepNeighbors } from "@/lib/portal-workflow-nav";
import { InspirationLinksPanel } from "@/components/portal/InspirationLinksPanel";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { InspirationStepContinueHint, WorkflowStepNavRow } from "@/components/portal/WorkflowStepNavRow";
import { SignageBrandKitSlim } from "@/components/portal/SignageBrandKitSlim";
import { FinalPaymentDialog, FinalDesignDownloadLink } from "@/components/portal/FinalDesignPaymentGate";
import { hasLockedFinalDesignFiles, isFinalDesignFileDownloadLocked } from "@/lib/portal-final-files";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { reviewProgressPercent } from "@/lib/portal-progress";
import {
  acknowledgePrintFinalDeliverables,
  skipPrintInspirationStep,
} from "@/app/portal/actions";
import { ClientReviewAssetSignOffForm } from "@/components/portal/ClientReviewAssetSignOffForm";
import { StudioAddReviewAssetForm } from "@/components/portal/StudioAddReviewAssetForm";
import { PortalBrandingMoodForm, PortalSavePrintSpecificationForm } from "@/components/portal/portal-flash-action-forms";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { ctaButtonClasses } from "@/components/ui/Button";
import { PORTAL_CLIENT_INPUT_CLASS, PortalStepSavedBadge } from "@/components/portal/PortalSectionCard";
import { loadWebsiteWorkspace } from "@/app/portal/project/[projectId]/website/_lib/load-website-workspace";

type Props = { params: { projectId: string; step: string } };

function isPrintStep(s: string): s is PrintStepSlug {
  return (PRINT_STEP_SLUGS as readonly string[]).includes(s);
}

export default async function PrintWorkflowStepPage({ params }: Props) {
  const { projectId, step: stepRaw } = params;
  if (!isPrintStep(stepRaw)) notFound();

  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(projectId, session);

  const studio = isStudioUser(session?.user?.email);
  if (normalizePortalKind(project.portalKind) !== "PRINT" && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  const [assets, accountKit, clientWorkflowAccessOpts] = await Promise.all([
    prisma.reviewAsset.findMany({
      where: { projectId: project.id, kind: "GENERAL" },
      orderBy: { createdAt: "asc" },
    }),
    loadAccountBrandKitSlice(project.userId),
    loadClientWorkflowAccessOpts(project.userId, project.id),
  ]);

  assertClientWorkflowStepAccess("print", stepRaw, project, studio, [], assets, accountKit, clientWorkflowAccessOpts);

  const stepEditable = clientStepEditable(
    "print",
    stepRaw,
    project,
    [],
    assets,
    accountKit,
    studio,
    clientWorkflowAccessOpts,
  );
  const stepComplete = streamStepComplete("print", stepRaw, project, [], assets, accountKit, clientWorkflowAccessOpts);
  const clientVerified = clientHasFullPortalAccess(project);
  const canEdit = !studio && clientVerified && stepEditable;
  const notesSaved = Boolean(project.brandingMoodDescription?.trim());

  const hubHref = `/portal/project/${project.id}`;
  const { prevHref, nextHref } = workflowStepNeighbors("print", project.id, stepRaw);

  const titles: Record<PrintStepSlug, string> = {
    "brand-kit": "Brand Kit",
    specification: "Print Specification",
    inspiration: "Inspiration (optional)",
    proofs: "Proofs & Feedback",
    "final-files": "Final Files & Order",
  };

  let specJson: Record<string, string> = {};
  try {
    specJson = JSON.parse(project.printSpecificationJson || "{}") as Record<string, string>;
  } catch {
    specJson = {};
  }

  let brandKitSection: ReactNode = null;
  if (stepRaw === "brand-kit") {
    const w = await loadWebsiteWorkspace(projectId, session, { forPrintBrandKit: true });
    if (!w.ok) {
      if ("notFound" in w) notFound();
      redirect(w.redirectTo);
    }
    const clientCanEdit =
      w.clientCanEdit &&
      clientStepEditable("print", "brand-kit", w.project, [], assets, accountKit, studio, clientWorkflowAccessOpts);
    brandKitSection = <SignageBrandKitSlim w={w} clientCanEdit={clientCanEdit} />;
  }

  return (
    <div>
      <Link
        href={hubHref}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Project hub
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">{titles[stepRaw]}</h1>
      {stepRaw === "inspiration" ? (
        <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-burgundy/70">
          Optional reference links and short notes for print. Skip this step if you like — it auto-completes and won&apos;t
          block proofs.
        </p>
      ) : null}

      {stepRaw === "brand-kit" ? brandKitSection : null}

      {stepRaw === "specification" ? (
        <PortalSavePrintSpecificationForm projectId={project.id} className="mt-10 max-w-xl space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-medium text-burgundy/80">Job summary *</span>
            <textarea
              name="summary"
              required
              rows={5}
              defaultValue={specJson.summary ?? ""}
              className={PORTAL_CLIENT_INPUT_CLASS}
              minLength={8}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-medium text-burgundy/80">Quantity</span>
            <input name="quantity" defaultValue={specJson.quantity ?? ""} className={PORTAL_CLIENT_INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-medium text-burgundy/80">Stock / paper</span>
            <input name="stock" defaultValue={specJson.stock ?? ""} className={PORTAL_CLIENT_INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-medium text-burgundy/80">Finishing</span>
            <textarea name="finishing" rows={2} defaultValue={specJson.finishing ?? ""} className={PORTAL_CLIENT_INPUT_CLASS} />
          </label>
          {canEdit ? (
            <PortalFormSubmitButton
              idleLabel="Submit specification"
              pendingLabel="Submitting…"
              successLabel="Specification saved ✓"
              errorFallback="Couldn’t save specification. Try again."
              variant="burgundy"
              size="sm"
            />
          ) : null}
        </PortalSavePrintSpecificationForm>
      ) : null}

      {stepRaw === "inspiration" ? (
        <div className="mt-10 max-w-none space-y-8 lg:max-w-4xl">
          <InspirationLinksPanel
            key={project.inspirationLinksJson}
            projectId={project.id}
            initialLinks={parseInspirationLinksJson(project.inspirationLinksJson || "[]")}
            canEdit={canEdit && !project.printInspirationSkipped}
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
              <h2 className="font-display text-lg text-burgundy">Written notes</h2>
              {notesSaved ? <PortalStepSavedBadge /> : null}
            </div>
            {canEdit && !project.printInspirationSkipped ? (
              <PortalBrandingMoodForm projectId={project.id} className="mt-4 flex flex-col gap-3">
                <textarea
                  name="moodDescription"
                  rows={4}
                  defaultValue={project.brandingMoodDescription || ""}
                  className={PORTAL_CLIENT_INPUT_CLASS}
                  maxLength={12000}
                />
                <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}>
                  Save notes
                </button>
              </PortalBrandingMoodForm>
            ) : (
              <p className="mt-4 whitespace-pre-wrap font-body text-sm text-burgundy/75">
                {project.printInspirationSkipped
                  ? "You skipped this optional step."
                  : project.brandingMoodDescription?.trim() || "—"}
              </p>
            )}
          </div>
          {canEdit && !project.printInspirationSkipped ? (
            <form action={skipPrintInspirationStep.bind(null, project.id)}>
              <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
                Skip inspiration (optional)
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {stepRaw === "proofs" ? (
        <PrintProofsBody project={project} studio={studio} assets={assets} canSignOff={canEdit} />
      ) : null}

      {stepRaw === "final-files" ? (
        <PrintFinalBody project={project} studio={studio} assets={assets} clientVerified={clientVerified} canEdit={canEdit} />
      ) : null}

      {stepRaw === "inspiration" && !studio && clientVerified ? (
        <InspirationStepContinueHint stepComplete={stepComplete} printOptional />
      ) : null}
      <WorkflowStepNavRow hubHref={hubHref} prevHref={prevHref} nextHref={nextHref} nextDisabled={!stepComplete} />
    </div>
  );
}

function PrintProofsBody({
  project,
  studio,
  assets,
  canSignOff,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProjectForSession>>>;
  studio: boolean;
  assets: Awaited<ReturnType<typeof prisma.reviewAsset.findMany>>;
  canSignOff: boolean;
}) {
  const pct = reviewProgressPercent(assets, "GENERAL");
  return (
    <>
      <div className="mt-10 max-w-xl">
        <PhaseProgressBar
          label="Print proofs"
          percent={pct}
          hint={
            assets.length
              ? `${assets.filter((a) => a.clientSignedOff).length} of ${assets.length} signed off`
              : "Proofs appear when the studio uploads them."
          }
        />
      </div>
      <ul className="mt-12 flex max-w-3xl flex-col gap-8">
        {assets.map((asset) => (
          <li key={asset.id} className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
              <div className="min-w-0">
                <h2 className="font-display text-cc-h4 text-burgundy">{asset.title}</h2>
                {asset.notes ? (
                  <p className="mt-3 whitespace-pre-wrap font-body text-sm text-burgundy/75">{asset.notes}</p>
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
          <h2 className="font-display text-lg text-burgundy">Add print proof</h2>
          <StudioAddReviewAssetForm className="mt-6 flex flex-col gap-4" idleLabel="Upload" variant="outline">
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="reviewAssetKind" value="GENERAL" />
            <input name="title" required className={PORTAL_CLIENT_INPUT_CLASS} placeholder="Title" />
            <textarea name="notes" rows={2} className={PORTAL_CLIENT_INPUT_CLASS} />
            <input name="file" type="file" className="font-body text-xs text-burgundy" />
          </StudioAddReviewAssetForm>
        </section>
      ) : null}
    </>
  );
}

function PrintFinalBody({
  project,
  studio,
  assets,
  clientVerified,
  canEdit,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProjectForSession>>>;
  studio: boolean;
  assets: Awaited<ReturnType<typeof prisma.reviewAsset.findMany>>;
  clientVerified: boolean;
  canEdit: boolean;
}) {
  const showFinalPaymentModal =
    !studio && clientVerified && hasLockedFinalDesignFiles(assets, project, studio);
  const proofsHref = `/portal/project/${project.id}/print/proofs`;
  return (
    <>
      {showFinalPaymentModal ? <FinalPaymentDialog projectId={project.id} autoOpen /> : null}
      <ul className="mt-10 flex max-w-3xl flex-col gap-6">
        {assets.map((asset) => (
          <li key={asset.id} className="rounded-xl border border-zinc-200/90 bg-white p-5">
            <h3 className="font-display text-cc-h4 text-burgundy">{asset.title}</h3>
            {asset.clientSignedOff && asset.filePath ? (
              <FinalDesignDownloadLink
                href={portalFilePublicUrl(asset.filePath)}
                locked={isFinalDesignFileDownloadLocked(asset, project, studio)}
                projectId={project.id}
              />
            ) : (
              <p className="mt-2 font-body text-sm text-burgundy/65">
                <Link href={proofsHref} className="underline">
                  Sign off on proofs
                </Link>{" "}
                first.
              </p>
            )}
          </li>
        ))}
      </ul>
      {!studio && clientVerified && assets.some((a) => a.filePath) && canEdit ? (
        <form action={acknowledgePrintFinalDeliverables.bind(null, project.id)} className="mt-10">
          <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}>
            Confirm print-ready files &amp; order
          </button>
        </form>
      ) : null}
    </>
  );
}
