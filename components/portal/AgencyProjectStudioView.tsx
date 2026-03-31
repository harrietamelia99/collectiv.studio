import Link from "next/link";
import type { ContentCalendarItem, Project, ProjectQuote, ReviewAsset, WebsitePageBrief } from "@prisma/client";
import {
  markClientContractSigned,
  markProjectComplete,
  markStudioDepositReceived,
  resetClientFinalPaymentAcknowledgment,
  setPortalKind,
  setProjectPaymentStatus,
  verifyClient,
} from "@/app/portal/actions";
import {
  addProjectInternalNote,
  saveProjectContractTerms,
  toggleStudioWebsiteLiveConfirmed,
  toggleStudioWorkflowStepReviewed,
  updateProjectAssignedStudioAdmin,
} from "@/app/portal/agency-actions";
import { AgencyProjectQuotePanel } from "@/components/portal/AgencyProjectQuotePanel";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { ResendClientInviteButton } from "@/components/portal/ResendClientInviteButton";
import { ProjectFeedbackSection } from "@/components/portal/ProjectFeedbackSection";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { ctaButtonClasses } from "@/components/ui/Button";
import { clientJourneyCombinedProgressPercent } from "@/lib/agency-combined-progress";
import { buildClientConversationStripData } from "@/lib/portal-conversation-strip";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { PAYMENT_STATUSES, paymentStatusStudioLabel } from "@/lib/portal-payment-status";
import {
  PORTAL_KINDS_STUDIO_ASSIGNABLE,
  clientVisibleAreasSummary,
  normalizePortalKind,
  portalKindLabel,
  visiblePortalSections,
} from "@/lib/portal-project-kind";
import type { WorkflowStepRow } from "@/lib/portal-workflow";
import {
  buildBrandingStepRows,
  buildPrintStepRows,
  buildSignageStepRows,
  buildWebsiteStepRows,
} from "@/lib/portal-workflow";
import { parseStudioReviewedStepsJson, studioHasReviewedStep } from "@/lib/studio-reviewed-steps";
import type { SocialOnboardingData } from "@/lib/social-onboarding";
import {
  loadStudioAdminUserOptions,
  studioAdminDisplayLabel,
  studioAdminRoleHint,
} from "@/lib/studio-admin-options";
import { weeklyDeliverablesSummaryLine } from "@/lib/social-batch-calendar";
import type { ClientWorkflowAccessOptions } from "@/lib/portal-brand-kit-gate";
import type { AccountBrandKitSlice } from "@/lib/portal-workflow";
import type { PersonaSlug } from "@/lib/studio-team-config";
import { HubIconDownload, HubIconGrid, HubIconPayment, HubIconSettings } from "@/components/portal/ProjectHubIcons";
import type { ReactNode } from "react";

type InternalNoteRow = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string | null; email: string };
};

type MessageRow = Parameters<typeof ProjectFeedbackSection>[0]["messages"];

function socialMonthBatchLabel(
  items: ContentCalendarItem[],
  now: Date,
): { label: string; detail: string } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const inMonth = items.filter((i) => {
    if (!i.scheduledFor) return false;
    const d = new Date(i.scheduledFor);
    return d.getUTCFullYear() === y && d.getUTCMonth() === m;
  });
  if (inMonth.length === 0) {
    return { label: "Not started", detail: "Nothing scheduled in the client’s calendar for this month yet." };
  }
  const allDone = inMonth.every((i) => i.clientSignedOff || i.postWorkflowStatus === "APPROVED");
  if (allDone) return { label: "Approved", detail: "All posts dated this month are approved or signed off." };
  if (inMonth.some((i) => i.postWorkflowStatus === "PENDING_APPROVAL")) {
    return { label: "Submitted", detail: "At least one post is waiting on the client in the calendar." };
  }
  if (inMonth.some((i) => i.postWorkflowStatus === "REVISION_NEEDED")) {
    return { label: "In progress", detail: "Revision round in progress — check calendar comments." };
  }
  return { label: "In progress", detail: "Drafts or placeholders still being prepared." };
}

function clientJourneyLabel(
  row: WorkflowStepRow,
  stream: string,
  slug: string,
  project: Project,
  portalUnlocked: boolean,
): string {
  if (row.complete) return "Complete";
  if (!portalUnlocked) return "Not started";
  if (row.locked) return "Not started";
  if (stream === "website" && slug === "preview" && project.websitePreviewClientFeedback?.trim()) {
    return "Awaiting agency";
  }
  if (row.status === "awaiting_agency") return "Awaiting agency";
  if (row.status === "awaiting_client") return "In progress";
  if (row.status === "in_progress") return "In progress";
  if (row.status === "locked") return "Not started";
  return "In progress";
}

const AGENCY_STEP_HELP: Record<string, string> = {
  "website:brand-kit": "Review the brand kit the client saved (or account defaults). Confirm it’s ready for build.",
  "website:content": "Review page tabs, copy, and reference images. Confirm content is ready for the build.",
  "website:preview": "Add or update the staging / live URL on this step. When the client requests changes, their notes appear below.",
  "website:domain": "Review domain and DNS details the client entered. Mark the site live once DNS is connected.",
  "branding:inspiration": "Review mood links and notes.",
  "branding:questionnaire": "Review the submitted brand questionnaire.",
  "branding:proofs": "Upload proof rounds. Client signs off here; revisions loop until approved.",
  "branding:final-files": "Upload final deliverables. Step completes when the client acknowledges receipt.",
  "signage:brand-kit": "Confirm brand kit (project or linked website kit) is complete.",
  "signage:inspiration": "Review inspiration the client added.",
  "signage:specification": "Review the signage specification form.",
  "signage:proofs": "Upload signage proofs for sign-off.",
  "signage:final-files": "Upload print-ready files and confirm order details. Client acknowledges on this step.",
  "print:brand-kit": "Confirm brand kit is complete for this print job.",
  "print:specification": "Review the print specification.",
  "print:inspiration": "Optional references — auto-complete if the client skipped.",
  "print:proofs": "Upload print proofs for sign-off.",
  "print:final-files": "Upload final files and confirm order. Client acknowledges here.",
};

function showMarkReviewed(stream: string, slug: string, project: Project): boolean {
  const k = `${stream}:${slug}`;
  const base =
    k === "website:brand-kit" ||
    k === "website:content" ||
    k === "branding:inspiration" ||
    k === "branding:questionnaire" ||
    k === "signage:brand-kit" ||
    k === "signage:inspiration" ||
    k === "signage:specification" ||
    k === "print:brand-kit" ||
    k === "print:specification";
  if (k === "print:inspiration" && project.printInspirationSkipped) return false;
  if (k === "print:inspiration") return true;
  return base;
}

function AgencyStepCard({
  projectId,
  stream,
  row,
  stepNo,
  project,
  reviewedMap,
  portalUnlocked,
}: {
  projectId: string;
  stream: "website" | "branding" | "signage" | "print";
  row: WorkflowStepRow;
  stepNo: number;
  project: Project;
  reviewedMap: Record<string, string>;
  portalUnlocked: boolean;
}) {
  const slug = row.slug;
  const key = `${stream}:${slug}`;
  const reviewed = studioHasReviewedStep(reviewedMap, key);
  const help = AGENCY_STEP_HELP[key] ?? "Open this step in the portal to work with the client.";
  const status = clientJourneyLabel(row, stream, slug, project, portalUnlocked);
  const previewFeedback =
    stream === "website" && slug === "preview" ? project.websitePreviewClientFeedback?.trim() : null;

  return (
    <li className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Step {stepNo} · {status}
          </p>
          <h3 className="mt-1 font-display text-lg tracking-[-0.02em] text-burgundy">{row.label}</h3>
          <p className="mt-2 font-body text-sm leading-relaxed text-burgundy/70">{help}</p>
          {previewFeedback ? (
            <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 font-body text-sm text-amber-950/90">
              <span className="font-semibold">Client feedback: </span>
              <span className="whitespace-pre-wrap">{previewFeedback}</span>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <Link
            href={row.href}
            className={ctaButtonClasses({ variant: "burgundy", size: "sm", className: "whitespace-nowrap" })}
          >
            Open step
          </Link>
          {showMarkReviewed(stream, slug, project) ? (
            <form action={toggleStudioWorkflowStepReviewed}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="stepKey" value={key} />
              <button
                type="submit"
                className={ctaButtonClasses({
                  variant: "outline",
                  size: "sm",
                  className: "w-full whitespace-nowrap",
                })}
              >
                {reviewed ? "Clear studio review flag" : "Mark reviewed"}
              </button>
            </form>
          ) : null}
          {stream === "website" && slug === "domain" ? (
            <form action={toggleStudioWebsiteLiveConfirmed}>
              <input type="hidden" name="projectId" value={projectId} />
              <button
                type="submit"
                className={ctaButtonClasses({
                  variant: "outline",
                  size: "sm",
                  className: "w-full whitespace-nowrap",
                })}
              >
                {project.studioWebsiteLiveConfirmedAt ? "Undo site live confirmation" : "Mark site live (studio)"}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function WorkflowBlock({
  title,
  projectId,
  stream,
  steps,
  project,
  reviewedMap,
  startStepNo,
  portalUnlocked,
}: {
  title: string;
  projectId: string;
  stream: "website" | "branding" | "signage" | "print";
  steps: WorkflowStepRow[];
  project: Project;
  reviewedMap: Record<string, string>;
  startStepNo: number;
  portalUnlocked: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg tracking-[-0.02em] text-burgundy">{title}</h3>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {steps.map((row, i) => (
          <AgencyStepCard
            key={row.slug}
            projectId={projectId}
            stream={stream}
            row={row}
            stepNo={startStepNo + i}
            project={project}
            reviewedMap={reviewedMap}
            portalUnlocked={portalUnlocked}
          />
        ))}
      </ul>
    </div>
  );
}

export async function AgencyProjectStudioView({
  project,
  items,
  assets,
  websitePageBriefs,
  messages,
  socialOnboardingData,
  inspirationLinksCount,
  accountBrandKit,
  clientWorkflowAccessOpts,
  canAssignProjectLead,
  internalNotes,
  viewerPersonaSlug,
  projectQuote,
}: {
  project: Project & {
    user: {
      name: string | null;
      email: string;
      businessName: string | null;
      passwordHash: string | null;
      firstName: string | null;
      clientInviteSentAt: Date | null;
      clientInviteExpiresAt: Date | null;
      clientRegisteredAt: Date | null;
    } | null;
    assignedStudioUser: Parameters<typeof buildClientConversationStripData>[0]["assignedStudioUser"];
  };
  items: ContentCalendarItem[];
  assets: ReviewAsset[];
  websitePageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[];
  messages: MessageRow;
  socialOnboardingData: SocialOnboardingData;
  inspirationLinksCount: number;
  accountBrandKit: AccountBrandKitSlice;
  clientWorkflowAccessOpts?: ClientWorkflowAccessOptions;
  canAssignProjectLead: boolean;
  internalNotes: InternalNoteRow[];
  viewerPersonaSlug: PersonaSlug;
  projectQuote: Pick<ProjectQuote, "intro" | "lineItemsJson" | "sentAt" | "updatedAt"> | null;
}) {
  /** Client-side locking and step status so agency cards match the client journey (not “everything in progress”). */
  const statusRowsAsClient = false;
  const isIssy = viewerPersonaSlug === "isabella";
  const isMay = viewerPersonaSlug === "may";
  const vis = visiblePortalSections(project.portalKind);
  const nk = normalizePortalKind(project.portalKind);
  const portalUnlocked = clientHasFullPortalAccess(project);
  const reviewedMap = parseStudioReviewedStepsJson(project.studioReviewedStepsJson);
  const now = new Date();
  const combinedPct = clientJourneyCombinedProgressPercent({
    project,
    pageBriefs: websitePageBriefs,
    assets,
    calendarItems: items,
    socialOnboardingData,
    inspirationLinkCount: inspirationLinksCount,
    accountKit: accountBrandKit,
    accessOpts: clientWorkflowAccessOpts,
    now,
  });
  const studioAdminOptions = await loadStudioAdminUserOptions();
  const conversationStrip = buildClientConversationStripData(project);
  const weeklyLine = weeklyDeliverablesSummaryLine(project.socialWeeklyScheduleJson);
  const socialMonth = socialMonthBatchLabel(items, now);
  const showDeposit = nk !== "SOCIAL";
  const clientLabel = [project.user?.name, project.user?.businessName].filter(Boolean).join(" · ") || "Client";
  const clientEmail = project.user?.email ?? project.invitedClientEmail ?? "—";

  const brandingRows = vis.branding
    ? buildBrandingStepRows(project.id, project, assets, statusRowsAsClient).steps
    : [];
  const websiteRows = vis.website
    ? buildWebsiteStepRows(
        project.id,
        project,
        websitePageBriefs,
        statusRowsAsClient,
        accountBrandKit,
        clientWorkflowAccessOpts,
      ).steps
    : [];
  const signageRows =
    vis.signage && nk !== "PRINT"
      ? buildSignageStepRows(project.id, project, assets, accountBrandKit, statusRowsAsClient, clientWorkflowAccessOpts)
          .steps
      : [];
  const printRows =
    nk === "PRINT"
      ? buildPrintStepRows(project.id, project, assets, accountBrandKit, statusRowsAsClient, clientWorkflowAccessOpts)
          .steps
      : [];

  const stepBlocks: ReactNode[] = [];
  let stepNo = 1;
  if (brandingRows.length) {
    stepBlocks.push(
      <WorkflowBlock
        key="branding"
        title="Branding"
        projectId={project.id}
        stream="branding"
        steps={brandingRows}
        project={project}
        reviewedMap={reviewedMap}
        startStepNo={stepNo}
        portalUnlocked={portalUnlocked}
      />,
    );
    stepNo += brandingRows.length;
  }
  if (websiteRows.length) {
    stepBlocks.push(
      <WorkflowBlock
        key="website"
        title="Website design"
        projectId={project.id}
        stream="website"
        steps={websiteRows}
        project={project}
        reviewedMap={reviewedMap}
        startStepNo={stepNo}
        portalUnlocked={portalUnlocked}
      />,
    );
    stepNo += websiteRows.length;
  }
  if (signageRows.length) {
    stepBlocks.push(
      <WorkflowBlock
        key="signage"
        title="Signage"
        projectId={project.id}
        stream="signage"
        steps={signageRows}
        project={project}
        reviewedMap={reviewedMap}
        startStepNo={stepNo}
        portalUnlocked={portalUnlocked}
      />,
    );
    stepNo += signageRows.length;
  }
  if (printRows.length) {
    stepBlocks.push(
      <WorkflowBlock
        key="print"
        title="Print"
        projectId={project.id}
        stream="print"
        steps={printRows}
        project={project}
        reviewedMap={reviewedMap}
        startStepNo={stepNo}
        portalUnlocked={portalUnlocked}
      />,
    );
    stepNo += printRows.length;
  }

  return (
    <div className="space-y-10">
      <section
        id="agency-project-header"
        className="scroll-mt-28 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-zinc-50 sm:flex">
                <HubIconGrid className="h-6 w-6 text-burgundy" aria-hidden />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-cc-h2 tracking-[-0.03em] text-burgundy">{project.name}</h1>
                <p className="mt-2 font-body text-sm text-burgundy/80">
                  <span className="font-medium text-burgundy">{clientLabel}</span>
                  {clientEmail !== "—" ? (
                    <>
                      <span className="text-burgundy/40"> · </span>
                      <a className="text-burgundy underline-offset-2 hover:underline" href={`mailto:${clientEmail}`}>
                        {clientEmail}
                      </a>
                    </>
                  ) : null}
                </p>
                <p className="mt-2 inline-flex items-center rounded-full border border-burgundy/20 bg-burgundy/[0.06] px-3 py-1 font-body text-xs font-medium text-burgundy">
                  {portalKindLabel(project.portalKind)}
                </p>
                {project.invitedClientEmail && !project.userId ? (
                  <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 font-body text-[13px] leading-relaxed text-amber-950/90">
                    <span className="font-semibold text-amber-950">Legacy invite · </span>
                    Awaiting signup — they can register at the portal with{" "}
                    <span className="font-mono text-[12px]">{project.invitedClientEmail}</span>. New invites use email
                    links instead.
                  </div>
                ) : null}
                {project.userId && project.user && !project.user.passwordHash ? (
                  <div className="mt-4 rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-3">
                    <p className="m-0 font-body text-xs font-semibold uppercase tracking-[0.08em] text-burgundy/55">
                      Client portal invite
                    </p>
                    <p className="mt-2 m-0 font-body text-sm text-burgundy/85">
                      <span className="font-medium text-burgundy">Invite sent</span>
                      {project.user.clientInviteSentAt ? (
                        <>
                          {" "}
                          ·{" "}
                          {project.user.clientInviteSentAt.toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </>
                      ) : null}
                    </p>
                    <p className="mt-1 m-0 font-body text-sm text-burgundy/70">
                      To <span className="font-mono text-[13px]">{project.user.email}</span>
                    </p>
                    {project.user.clientInviteExpiresAt ? (
                      <p className="mt-2 m-0 font-body text-[12px] text-burgundy/55">
                        {project.user.clientInviteExpiresAt.getTime() > Date.now()
                          ? `Registration link valid until ${project.user.clientInviteExpiresAt.toLocaleString("en-GB", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}.`
                          : "Registration link has expired — resend a fresh invite below."}
                      </p>
                    ) : null}
                    {isIssy ? (
                      <div className="mt-4 max-w-xs border-t border-zinc-200/80 pt-4">
                        <ResendClientInviteButton projectId={project.id} />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {project.user?.passwordHash ? (
                  <p className="mt-3 m-0 font-body text-[13px] text-burgundy/70">
                    <span className="font-medium text-burgundy">Registered</span>
                    {project.user.clientRegisteredAt
                      ? ` · ${project.user.clientRegisteredAt.toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}`
                      : null}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-6 max-w-xl">
              <PhaseProgressBar
                label="Overall project progress (matches client steps)"
                percent={combinedPct}
                hint="Weighted across every active workstream on this project."
              />
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 border-t border-zinc-200/90 pt-6 lg:w-80 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            {isIssy ? (
              <>
                {studioAdminOptions.length > 0 ? (
                  canAssignProjectLead ? (
                    <form action={updateProjectAssignedStudioAdmin.bind(null, project.id)} className="space-y-2">
                      <label className="block font-body text-xs font-medium text-burgundy/70">
                        Assigned lead
                        <select
                          name="assignedStudioUserId"
                          defaultValue={project.assignedStudioUserId ?? ""}
                          className={`${PORTAL_CLIENT_INPUT_CLASS} mt-1.5`}
                        >
                          <option value="">No assignee</option>
                          {studioAdminOptions.map((a) => (
                            <option key={a.id} value={a.id}>
                              {studioAdminDisplayLabel(a)}
                              {studioAdminRoleHint(a.studioTeamProfile?.personaSlug)
                                ? ` — ${studioAdminRoleHint(a.studioTeamProfile?.personaSlug)}`
                                : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="submit"
                        className={ctaButtonClasses({ variant: "burgundy", size: "sm", className: "w-full" })}
                      >
                        Save assignee
                      </button>
                    </form>
                  ) : (
                    <div className="font-body text-sm text-burgundy/75">
                      <span className="font-medium text-burgundy">Lead: </span>
                      {project.assignedStudioUser
                        ? studioAdminDisplayLabel(project.assignedStudioUser as never)
                        : "Unassigned — Issy can set the lead."}
                    </div>
                  )
                ) : (
                  <p className="font-body text-xs text-amber-900/85">
                    No studio admins in the assignee list yet — add <span className="font-mono">STUDIO_EMAIL</span> users
                    and have each sign in once.
                  </p>
                )}
                <form action={setPortalKind.bind(null, project.id)} className="space-y-2 border-t border-zinc-100 pt-4">
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
                  <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-full" })}>
                    Save type
                  </button>
                </form>
              </>
            ) : (
              <div className="font-body text-sm text-burgundy/75">
                <span className="font-medium text-burgundy">Lead: </span>
                {project.assignedStudioUser
                  ? studioAdminDisplayLabel(project.assignedStudioUser as never)
                  : "Not assigned yet — Issy sets leads and project type."}
              </div>
            )}
          </div>
        </div>
      </section>

      {isIssy ? (
        <section id="agency-onboarding" className="scroll-mt-28 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-lg tracking-[-0.02em] text-burgundy">Onboarding &amp; hub access</h2>
          <p className="mt-1 font-body text-sm text-burgundy/60">
            Contract and deposit gates match what the client needs before the workspace opens. Hub unlocks automatically
            when those conditions are met.
          </p>
          <AgencyProjectQuotePanel
            key={projectQuote?.updatedAt?.getTime() ?? `new-${project.id}`}
            projectId={project.id}
            initialIntro={projectQuote?.intro ?? ""}
            initialLineItemsJson={projectQuote?.lineItemsJson ?? "[]"}
            sentAt={projectQuote?.sentAt ?? null}
          />
          <div id="agency-contract-terms" className="scroll-mt-28 mt-8 border-t border-zinc-100 pt-8">
            <h3 className="font-display text-base tracking-[-0.02em] text-burgundy">Client contract text</h3>
            <p className="mt-1 font-body text-xs leading-relaxed text-burgundy/55">
              The client sees this in full on their project page and must scroll through it before signing. If they already
              signed in the portal, the exact wording they agreed to stays stored as a snapshot — edits here only change what
              new clients see before signing.
            </p>
            <form action={saveProjectContractTerms.bind(null, project.id)} className="mt-4 space-y-3">
              <textarea
                name="contractTermsText"
                rows={14}
                defaultValue={project.contractTermsText ?? ""}
                className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[12rem] font-body text-sm leading-relaxed`}
                placeholder="Paste or write the full service agreement for this project…"
              />
              <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}>
                Save contract text
              </button>
            </form>
          </div>
          <dl className="mt-8 grid gap-3 font-body text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Contract</dt>
              <dd className="mt-1 font-medium text-burgundy">
                {project.clientContractSignedAt ? "Signed" : "Unsigned"}
                {project.clientContractSignedAt && project.contractSignedTypedName ? (
                  <span className="mt-2 block font-body text-xs font-normal leading-relaxed text-burgundy/70">
                    In portal:{" "}
                    <strong className="font-medium text-burgundy">{project.contractSignedTypedName}</strong>
                    <br />
                    {project.clientContractSignedAt.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {project.contractSignedIp ? (
                      <>
                        <br />
                        IP: {project.contractSignedIp}
                      </>
                    ) : null}
                  </span>
                ) : project.clientContractSignedAt ? (
                  <span className="mt-2 block font-body text-xs font-normal text-burgundy/70">
                    Marked signed by studio (outside portal or manual).
                  </span>
                ) : null}
              </dd>
            </div>
            {showDeposit ? (
              <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Deposit</dt>
                <dd className="mt-1 font-medium text-burgundy">
                  {project.studioDepositMarkedPaidAt ? "Paid" : "Unpaid"}
                </dd>
              </div>
            ) : null}
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Client hub</dt>
              <dd className="mt-1 font-medium text-burgundy">{portalUnlocked ? "Unlocked" : "Locked"}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <form action={markClientContractSigned}>
              <input type="hidden" name="projectId" value={project.id} />
              <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
                {project.clientContractSignedAt ? "Clear contract signed" : "Mark contract signed"}
              </button>
            </form>
            {showDeposit ? (
              <form action={markStudioDepositReceived}>
                <input type="hidden" name="projectId" value={project.id} />
                <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
                  {project.studioDepositMarkedPaidAt ? "Clear deposit paid" : "Mark deposit paid"}
                </button>
              </form>
            ) : null}
            {!portalUnlocked ? (
              <form action={verifyClient.bind(null, project.id)}>
                <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}>
                  Open full client hub
                </button>
              </form>
            ) : null}
          </div>
        </section>
      ) : null}

      <section id="agency-project-steps" className="scroll-mt-28 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-xl tracking-[-0.02em] text-burgundy">Project steps</h2>
        <p className="mt-1 font-body text-sm text-burgundy/60">
          Same order as the client portal. Status reflects the client journey; use Open step to work in context.
        </p>
        <div className="mt-8 space-y-12">
          {!isMay ? stepBlocks : null}
          {vis.social ? (
            <div className="space-y-4">
              <h3 className="font-display text-lg tracking-[-0.02em] text-burgundy">Social media</h3>
              <ul className="m-0 list-none space-y-3 p-0">
                <li className="rounded-xl border border-zinc-200/90 bg-zinc-50/40 p-4">
                  <p className="font-body text-sm font-medium text-burgundy">This month on the calendar</p>
                  <p className="mt-1 font-body text-sm text-burgundy/75">
                    <span className="font-semibold text-burgundy">{socialMonth.label}</span> — {socialMonth.detail}
                  </p>
                  {weeklyLine ? <p className="mt-2 font-body text-sm text-burgundy/65">{weeklyLine}</p> : null}
                  <Link
                    href={`/portal/project/${project.id}/social/calendar`}
                    className={ctaButtonClasses({ variant: "burgundy", size: "sm", className: "mt-4 inline-flex" })}
                  >
                    Open social calendar
                  </Link>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {isIssy ? (
        <section
          id="agency-subscription-payment"
          className="scroll-mt-28 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <HubIconPayment className="h-5 w-5 text-burgundy/70" aria-hidden />
            <h2 className="font-display text-lg tracking-[-0.02em] text-burgundy">Subscription &amp; payment status</h2>
          </div>
          <p className="mt-2 font-body text-sm text-burgundy/60">
            This is exactly what the client sees on their dashboard after their hub is open — keep it accurate.
          </p>
          <form action={setProjectPaymentStatus} className="mt-6 flex max-w-xl flex-col gap-4">
            <input type="hidden" name="projectId" value={project.id} />
            <label className="flex flex-col gap-2">
              <span className="font-body text-sm font-medium text-burgundy/80">Status</span>
              <select name="paymentStatus" defaultValue={project.paymentStatus} className={PORTAL_CLIENT_INPUT_CLASS}>
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
                defaultValue={project.paymentNoteForClient ?? ""}
                className={PORTAL_CLIENT_INPUT_CLASS}
              />
            </label>
            <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm", className: "w-fit" })}>
              Save subscription &amp; payment status
            </button>
          </form>
        </section>
      ) : null}

      <section id="agency-messages" className="scroll-mt-28">
        <ProjectFeedbackSection
          projectId={project.id}
          messages={messages}
          canPost
          sectionId="project-messages"
          clientVisualEmphasis
          conversationParticipants={conversationStrip}
          studioCanDeleteMessages
          messagesThreadRole="studio"
        />
      </section>

      <section
        id="agency-internal-notes"
        className="scroll-mt-28 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 p-5 sm:p-6"
      >
        <h2 className="font-display text-lg tracking-[-0.02em] text-zinc-900">Internal notes (agency only)</h2>
        <p className="mt-1 font-body text-sm text-zinc-600">
          Never visible to the client. Use for handovers and operational context.
        </p>
        <ul className="mt-5 space-y-4">
          {internalNotes.length === 0 ? (
            <li className="font-body text-sm text-zinc-500">No notes yet.</li>
          ) : (
            internalNotes.map((n) => (
              <li key={n.id} className="rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
                  {n.createdAt.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  · {n.author.name?.trim() || n.author.email}
                </p>
                <p className="mt-2 whitespace-pre-wrap font-body text-sm text-zinc-800">{n.body}</p>
              </li>
            ))
          )}
        </ul>
        <form action={addProjectInternalNote.bind(null, project.id)} className="mt-6 space-y-3 border-t border-zinc-200 pt-6">
          <label className="block font-body text-sm font-medium text-zinc-700">Add a note</label>
          <textarea name="body" rows={3} className={PORTAL_CLIENT_INPUT_CLASS} placeholder="Handover, context, reminders…" />
          <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}>
            Save internal note
          </button>
        </form>
      </section>

      {isIssy ? (
        <section id="agency-wrap-up" className="scroll-mt-28 space-y-6 border-t border-zinc-200 pt-8">
          <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-burgundy/40">
            Wrap-up
          </h2>
          {!project.studioMarkedCompleteAt ? (
            <form action={markProjectComplete.bind(null, project.id)}>
              <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
                Mark project complete (client feedback form)
              </button>
            </form>
          ) : (
            <p className="font-body text-sm text-burgundy/70">
              Marked complete{" "}
              {project.studioMarkedCompleteAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.
            </p>
          )}
          <div className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <HubIconDownload className="h-5 w-5 text-burgundy/70" aria-hidden />
              <h3 className="font-display text-lg tracking-[-0.02em] text-burgundy">Final design downloads</h3>
            </div>
            <p className="mt-2 font-body text-sm text-burgundy/70">
              Signed-off finals stay gated until the client confirms final payment in the portal.
            </p>
            {project.clientAcknowledgedFinalPaymentAt ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-body text-sm text-burgundy/80">
                  Client confirmed final payment{" "}
                  <span className="tabular-nums">
                    {project.clientAcknowledgedFinalPaymentAt.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </p>
                <form action={resetClientFinalPaymentAcknowledgment}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
                    Reset confirmation
                  </button>
                </form>
              </div>
            ) : (
              <p className="mt-3 font-body text-sm text-burgundy/60">Client has not confirmed final payment yet.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
