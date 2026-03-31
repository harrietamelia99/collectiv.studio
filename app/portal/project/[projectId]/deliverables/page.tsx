import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isStudioUser } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { normalizePortalKind, visiblePortalSections } from "@/lib/portal-project-kind";
import { reviewProgressPercent } from "@/lib/portal-progress";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { FinalPaymentDialog, FinalDesignDownloadLink } from "@/components/portal/FinalDesignPaymentGate";
import { hasLockedFinalDesignFiles, isFinalDesignFileDownloadLocked } from "@/lib/portal-final-files";
import { ClientReviewAssetSignOffForm } from "@/components/portal/ClientReviewAssetSignOffForm";
import { StudioAddReviewAssetForm } from "@/components/portal/StudioAddReviewAssetForm";

type Props = { params: { projectId: string } };

export default async function ProjectDeliverablesPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(params.projectId, session);

  const studio = isStudioUser(session?.user?.email);
  const vis = visiblePortalSections(project.portalKind);
  if (!vis.deliverables && !studio) {
    const k = normalizePortalKind(project.portalKind);
    if (k === "BRANDING") {
      redirect(`/portal/project/${project.id}/branding/final-files`);
    }
    if (k === "PRINT") {
      redirect(`/portal/project/${project.id}/print/final-files`);
    }
    if (k === "SIGNAGE") {
      redirect(`/portal/project/${project.id}/signage/final-files#signage-shared-files`);
    }
    if (k === "MULTI" || k === "ONE_OFF") {
      if (visiblePortalSections(project.portalKind).branding) {
        redirect(`/portal/project/${project.id}/branding/final-files`);
      }
      if (visiblePortalSections(project.portalKind).signage) {
        redirect(`/portal/project/${project.id}/signage/final-files#signage-shared-files`);
      }
    }
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  if (normalizePortalKind(project.portalKind) === "PRINT") {
    redirect(`/portal/project/${project.id}/print/final-files`);
  }

  if (normalizePortalKind(project.portalKind) === "SIGNAGE") {
    redirect(`/portal/project/${project.id}/signage/final-files#signage-shared-files`);
  }

  const assets = await prisma.reviewAsset.findMany({
    where: { projectId: project.id, kind: "GENERAL" },
    orderBy: { createdAt: "asc" },
  });
  const pct = reviewProgressPercent(assets, "GENERAL");
  const clientVerified = clientHasFullPortalAccess(project);
  const showFinalPaymentModal =
    !studio && clientVerified && hasLockedFinalDesignFiles(assets, project, studio);
  const isPrintProject = normalizePortalKind(project.portalKind) === "PRINT";

  return (
    <div>
      <Link
        href={`/portal/project/${project.id}`}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Project overview
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">
        {isPrintProject ? "Printed materials" : "Shared files for sign-off"}
      </h1>
      <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-burgundy/70">
        {isPrintProject
          ? "Review print proofs and exports from the studio — sign off when you're happy for us to proceed with production. Printing and delivery are coordinated in Messages."
          : "The studio can upload briefs, mock-ups, exports, SVGs, PDFs and other files you need to download. Sign off when you are happy for us to proceed."}
      </p>
      {!studio && clientVerified ? (
        <p
          id="deliverables-final-note"
          className="scroll-mt-28 mt-3 max-w-xl font-body text-[13px] leading-relaxed text-burgundy/60"
        >
          <strong className="font-medium text-burgundy/80">Final files:</strong> anything you&apos;ve already signed off
          stays locked until you confirm your final payment in the popup — then downloads open as normal.
        </p>
      ) : null}

      {showFinalPaymentModal ? <FinalPaymentDialog projectId={project.id} autoOpen /> : null}

      <div id="deliverables-hub-section" className="scroll-mt-28 mt-10 max-w-xl">
        <PhaseProgressBar
          label={isPrintProject ? "Print deliverables" : "Shared deliverables"}
          percent={pct}
          hint={
            assets.length
              ? `${assets.filter((a) => a.clientSignedOff).length} of ${assets.length} items signed off`
              : "Files will appear here when the studio adds them."
          }
        />
      </div>

      <ul className="mt-12 flex flex-col gap-8">
        {assets.map((asset) => (
          <li
            key={asset.id}
            className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm md:p-6"
          >
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
              {!studio && !asset.clientSignedOff ? (
                <ClientReviewAssetSignOffForm projectId={project.id} assetId={asset.id} className="md:shrink-0" />
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {studio ? (
        <section className="mt-16 border-t-cc border-solid border-[var(--cc-hairline-cream-edge)] pt-12">
          <h2 className="font-display text-cc-h3 text-burgundy">Upload for client review</h2>
          <p className="mt-2 max-w-xl font-body text-sm text-burgundy/65">
            Add a title, optional notes, and attach a file (PDF, images, zip, etc.). Your client is notified when they
            next open the portal.
          </p>
          <StudioAddReviewAssetForm
            className="mt-6 flex max-w-lg flex-col gap-4"
            idleLabel="Add deliverable"
            variant="outline"
            size="md"
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
    </div>
  );
}
