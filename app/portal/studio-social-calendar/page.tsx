import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isStudioUser, projectWhereStudioMayViewSocialCalendar } from "@/lib/portal-access";
import { PORTAL_KINDS_WITH_SOCIAL } from "@/lib/portal-project-kind";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { parseCalendarChannelsJson } from "@/lib/calendar-channels";
import { projectUsesBatchSocialCalendar } from "@/lib/social-batch-calendar";
import { SocialCalendarLiveSync } from "@/components/portal/SocialCalendarLiveSync";
import { SocialContentCalendar, type SocialCalendarItem } from "@/components/portal/SocialContentCalendar";
import { parseCalendarActivityLogJson } from "@/lib/calendar-activity-log";

export const metadata: Metadata = {
  title: "Social content calendar | Studio portal",
  description: "All clients’ scheduled social posts in one calendar.",
};

export default async function StudioSocialMasterCalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/portal/login");
  if (!isStudioUser(session.user.email)) redirect("/portal");

  const studioMember = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  const viewerPersonaSlug = studioMember?.personaSlug ?? null;
  if (viewerPersonaSlug === "isabella") redirect("/portal");

  const [rows, studioMasterPostTargets] = await Promise.all([
    prisma.contentCalendarItem.findMany({
      where: {
        project: {
          portalKind: { in: [...PORTAL_KINDS_WITH_SOCIAL] },
          ...projectWhereStudioMayViewSocialCalendar(session.user.id, viewerPersonaSlug),
        },
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
      include: {
        project: {
          select: { id: true, name: true, websiteLogoPath: true, socialWeeklyScheduleJson: true },
        },
      },
    }),
    prisma.project.findMany({
      where: {
        portalKind: { in: [...PORTAL_KINDS_WITH_SOCIAL] },
        ...projectWhereStudioMayViewSocialCalendar(session.user.id, viewerPersonaSlug),
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const items: SocialCalendarItem[] = rows.map((row) => ({
    id: row.id,
    scheduledFor: row.scheduledFor?.toISOString() ?? null,
    title: row.title,
    caption: row.caption,
    hashtags: row.hashtags,
    clientSignedOff: row.clientSignedOff,
    clientFeedback: row.clientFeedback,
    imageUrl: row.imagePath ? portalFilePublicUrl(row.imagePath) : null,
    channels: parseCalendarChannelsJson(row.channelsJson),
    projectId: row.project.id,
    projectName: row.project.name,
    projectLogoPath: row.project.websiteLogoPath,
    postWorkflowStatus: row.postWorkflowStatus,
    postFormat: row.postFormat,
    planMonthKey: row.planMonthKey,
    isPlanPlaceholder: row.isPlanPlaceholder,
    usesBatchCalendar: projectUsesBatchSocialCalendar(row.project.socialWeeklyScheduleJson),
    activityLog: parseCalendarActivityLogJson(row.calendarActivityLogJson),
  }));

  return (
    <div>
      <SocialCalendarLiveSync />
      <Link
        href="/portal"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Studio home
      </Link>
      <header className="mt-6 max-w-3xl">
        <h1 className="font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Social content calendar</h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-burgundy/70 md:text-[15px]">
          {viewerPersonaSlug === "may" ? (
            <>
              Scheduled posts for <strong className="font-semibold text-burgundy">your</strong> assigned social and
              multi-area clients only. Open a row to jump to that client&apos;s social workspace.
            </>
          ) : (
            <>
              Scheduled posts for projects where you&apos;re the assigned lead, plus any project that doesn&apos;t have a
              lead yet. Open a row to jump to that client&apos;s social workspace.
            </>
          )}
        </p>
      </header>

      <SocialContentCalendar
        items={items}
        studioAggregate
        studioMasterPostTargets={studioMasterPostTargets}
        containerClassName="mt-8"
      />
    </div>
  );
}
