import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isAgencyPortalSession, studioMayAccessProjectSocialCalendar } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { socialMonthlyCalendarProgressPercent, socialMonthlyPostCounts } from "@/lib/portal-progress";
import { visiblePortalSections } from "@/lib/portal-project-kind";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { parseCalendarChannelsJson } from "@/lib/calendar-channels";
import { parseCalendarActivityLogJson } from "@/lib/calendar-activity-log";
import {
  ensureSocialPlaceholdersForProject,
  projectUsesBatchSocialCalendar,
  syncCalendarWorkflowFromLegacyFlags,
  weeklyDeliverablesSummaryLine,
} from "@/lib/social-batch-calendar";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { PortalSectionCard } from "@/components/portal/PortalSectionCard";
import { SocialContentCalendar } from "@/components/portal/SocialContentCalendar";
import { SocialMonthBatchBar } from "@/components/portal/SocialMonthBatchBar";
import { SocialWeeklyDeliverablesBanner } from "@/components/portal/SocialWeeklyDeliverablesBanner";
import { SocialCalendarLiveSync } from "@/components/portal/SocialCalendarLiveSync";
import { formatUkMonthYearFromDate } from "@/lib/uk-datetime";

type Props = {
  params: { projectId: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

const socialBase = (projectId: string) => `/portal/project/${projectId}/social`;

export default async function ProjectSocialCalendarPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(params.projectId, session);

  const studio = isAgencyPortalSession(session);
  const studioAgencyRole = session?.user?.agencyRole ?? null;

  const vis = visiblePortalSections(project.portalKind);
  if (!vis.social && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  const isSocialOnly = project.portalKind === "SOCIAL";
  const clientVerified = clientHasFullPortalAccess(project);
  const onboardingDone = !!project.socialOnboardingSubmittedAt;

  if (!studio && isSocialOnly && !onboardingDone) {
    redirect(socialBase(project.id));
  }

  await syncCalendarWorkflowFromLegacyFlags(project.id);
  await ensureSocialPlaceholdersForProject(project.id);

  const items = await prisma.contentCalendarItem.findMany({
    where: { projectId: project.id },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
  });
  const batchMode = projectUsesBatchSocialCalendar(project.socialWeeklyScheduleJson);

  const clientCalendarReview = !studio && clientVerified && items.length > 0;
  const clientVisibleStatuses = ["PENDING_APPROVAL", "APPROVED", "REVISION_NEEDED"] as const;
  const itemsForCalendar = studio
    ? items
    : items.filter((i) =>
        clientVisibleStatuses.includes(i.postWorkflowStatus as (typeof clientVisibleStatuses)[number]),
      );

  const nowCal = new Date();
  const monthLabelCal = formatUkMonthYearFromDate(nowCal);
  const pct = socialMonthlyCalendarProgressPercent(itemsForCalendar, nowCal);
  const monthCountsCal = socialMonthlyPostCounts(itemsForCalendar, nowCal);

  const calendarItems = itemsForCalendar.map((item) => ({
    id: item.id,
    scheduledFor: item.scheduledFor?.toISOString() ?? null,
    title: item.title,
    caption: item.caption,
    hashtags: item.hashtags,
    clientSignedOff: item.clientSignedOff,
    clientFeedback: item.clientFeedback,
    imageUrl: item.imagePath ? portalFilePublicUrl(item.imagePath) : null,
    channels: parseCalendarChannelsJson(item.channelsJson),
    projectId: project.id,
    projectName: project.name,
    projectLogoPath: project.websiteLogoPath,
    postWorkflowStatus: item.postWorkflowStatus,
    postFormat: item.postFormat,
    planMonthKey: item.planMonthKey,
    isPlanPlaceholder: item.isPlanPlaceholder,
    usesBatchCalendar: batchMode,
    activityLog: parseCalendarActivityLogJson(item.calendarActivityLogJson),
  }));

  const draftMonthKeys = Array.from(
    new Set(
      items.filter((i) => i.planMonthKey && i.postWorkflowStatus === "DRAFT").map((i) => i.planMonthKey!),
    ),
  ).sort();

  const pendingApprovalMonthKeys = Array.from(
    new Set(
      items
        .filter((i) => i.planMonthKey && i.postWorkflowStatus === "PENDING_APPROVAL")
        .map((i) => i.planMonthKey!),
    ),
  ).sort();

  const clientWaitingOnVisiblePosts =
    clientCalendarReview && itemsForCalendar.length === 0 && items.length > 0;
  const studioStillPreparingBatch = batchMode && clientWaitingOnVisiblePosts;

  const studioSeesSocialCalendar =
    !studio ||
    (studioAgencyRole != null &&
      studioMayAccessProjectSocialCalendar(project, session?.user?.id, studioAgencyRole));
  const assigneeShortName =
    project.assignedStudioUser?.studioTeamProfile?.welcomeName?.trim() ||
    (project.assignedStudioUser?.name ?? "").trim().split(/\s+/)[0] ||
    project.assignedStudioUser?.email?.split("@")[0] ||
    null;

  const postParam = searchParams?.post;
  const initialOpenPostId =
    typeof postParam === "string" && postParam.trim().length > 0 ? postParam.trim() : null;

  const weeklyDeliverablesSummary = weeklyDeliverablesSummaryLine(project.socialWeeklyScheduleJson);

  return (
    <div>
      <SocialCalendarLiveSync projectId={project.id} />
      <Link
        href="/portal"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Your projects
      </Link>
      <Link
        href={`/portal/project/${project.id}`}
        className="ml-4 font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        Project overview
      </Link>
      <Link
        href={socialBase(project.id)}
        scroll={false}
        className="ml-4 font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        Social subscription
      </Link>

      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Content calendar</h1>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-burgundy/70">
        Open each post to see the creative, caption, and where it&apos;s planned to go live. Approve when you&apos;re
        happy, or leave notes — we&apos;ll see what&apos;s ready to schedule and what needs another pass.
      </p>

      <PortalSectionCard
        id="social-step-3"
        headingId="social-step-3-heading"
        title="Monthly view &amp; sign-off"
        description={null}
        variant="client"
        className="mt-10"
      >
        <div className="scroll-mt-28">
          {!studio || studioSeesSocialCalendar ? (
            <>
              {studio && studioSeesSocialCalendar ? (
                <div className="mb-6 max-w-3xl">
                  <SocialWeeklyDeliverablesBanner
                    summary={weeklyDeliverablesSummary}
                    planningHref={`${socialBase(project.id)}/planning`}
                  />
                </div>
              ) : null}

              <div className="max-w-xl">
                <PhaseProgressBar
                  label="This month · sign-off"
                  percent={pct}
                  hint={
                    items.length
                      ? studioStillPreparingBatch
                        ? "Your studio will send each month for review when it is ready."
                        : monthCountsCal.inMonth > 0
                          ? `${monthCountsCal.signedOff} of ${monthCountsCal.inMonth} posts dated in ${monthLabelCal} are signed off.`
                          : `Nothing dated in ${monthLabelCal} in the posts you can see here.`
                      : "No posts in the calendar yet."
                  }
                />
              </div>

              {clientWaitingOnVisiblePosts ? (
                <p className="mt-6 max-w-xl rounded-lg border border-burgundy/15 bg-burgundy/[0.04] px-4 py-4 font-body text-sm leading-relaxed text-burgundy/80">
                  {studioStillPreparingBatch ? (
                    <>
                      Your studio is still preparing this month&apos;s content. You&apos;ll get an in-portal notification
                      when the full month is ready for you to review — then you can approve posts here or use &quot;Approve
                      all&quot; if you&apos;re happy with everything.
                    </>
                  ) : (
                    <>
                      Nothing has been sent to you for review yet — draft posts stay on the studio side until they submit
                      them for approval. You&apos;ll get an in-portal notification when there is something to review.
                    </>
                  )}
                </p>
              ) : null}

              {itemsForCalendar.length > 0 || (studio && studioSeesSocialCalendar) ? (
                <>
                  <SocialMonthBatchBar
                    projectId={project.id}
                    batchMode={batchMode}
                    studio={Boolean(studio && studioSeesSocialCalendar)}
                    clientReview={Boolean(clientCalendarReview)}
                    draftMonthKeys={draftMonthKeys}
                    pendingApprovalMonthKeys={pendingApprovalMonthKeys}
                  />
                  <SocialContentCalendar
                    items={calendarItems}
                    clientReviewMode={clientCalendarReview}
                    projectId={project.id}
                    projectDisplayName={project.name}
                    studioCanAddPosts={Boolean(studio && studioSeesSocialCalendar)}
                    initialOpenPostId={initialOpenPostId}
                    batchMode={batchMode}
                  />
                </>
              ) : (
                <p className="mt-8 max-w-xl font-body text-sm text-burgundy/60">
                  No posts in the calendar yet. When the studio adds content, you&apos;ll see the month view here.
                </p>
              )}
            </>
          ) : (
            <div
              className="mt-6 rounded-xl border border-amber-200/70 bg-amber-50/45 p-5 shadow-sm sm:p-6"
              role="status"
            >
              <p className="font-body text-sm font-medium text-amber-950/90">Calendar visible to the account lead only</p>
              <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-amber-950/80">
                The social content calendar for this project is shown only to whoever is set as{" "}
                <strong className="font-medium">project lead</strong> on the overview — your client-facing point of
                contact.
                {assigneeShortName ? (
                  <>
                    {" "}
                    Right now that&apos;s <span className="font-medium text-amber-950">{assigneeShortName}</span>.
                  </>
                ) : null}
              </p>
              <Link
                href={`/portal/project/${project.id}#project-studio-lead`}
                className="mt-4 inline-flex font-body text-sm font-medium text-burgundy underline decoration-burgundy/30 underline-offset-4 hover:decoration-burgundy/60"
              >
                Open project overview to check the assignee
              </Link>
            </div>
          )}
        </div>

        {studio && studioSeesSocialCalendar ? (
          <p className="mt-8 max-w-xl font-body text-sm text-burgundy/65">
            Tap a day <span className="font-medium">with</span> posts to preview; tap an <span className="font-medium">empty</span> day to add one in the drawer (no page change). Drafts stay internal until you submit for approval. Signed-off posts include copy/download actions in the preview.
          </p>
        ) : null}

        {!studio && clientVerified && items.length > 0 ? (
          <p className="mt-8 max-w-xl font-body text-sm text-burgundy/60">
            Tip: tap any day with posts to open the preview. If there are several posts that day, use the arrows in the
            popup or the chips under the calendar.
          </p>
        ) : null}
      </PortalSectionCard>
    </div>
  );
}
