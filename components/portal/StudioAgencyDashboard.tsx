import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { completeAgencyTodo } from "@/app/portal/agency-actions";
import { AgencyCreateProjectForm } from "@/components/portal/AgencyCreateProjectForm";
import { AgencyDashboardAddTodoForm } from "@/components/portal/AgencyDashboardAddTodoForm";
import { AgencyDashboardCompletedTodoActions } from "@/components/portal/AgencyDashboardCompletedTodoActions";
import { AgencyTodoDeleteConfirmButton } from "@/components/portal/AgencyTodoDeleteConfirmButton";
import { StudioAgencyCommsPanels } from "@/components/portal/StudioAgencyCommsPanels";
import type { CalendarInboxRowUi, ThreadInboxRowUi } from "@/components/portal/StudioAgencyClientInboxSections";
import { StudioDashboardSectionNav } from "@/components/portal/StudioDashboardSectionNav";
import {
  DashIconCalendar,
  DashIconHome,
  DashIconInbox,
  DashIconProjects,
  DashIconTasks,
  StudioSectionIcon,
} from "@/components/portal/StudioDashboardIcons";
import {
  isStudioUser,
  projectWhereStudioMayViewSocialCalendar,
  projectWhereVisibleToStudioMemberOnDashboard,
  studioMemberMayAccessProject,
} from "@/lib/portal-access";
import { projectIdFromStudioNotificationHref } from "@/lib/studio-notification-href";
import { PORTAL_KINDS_WITH_SOCIAL } from "@/lib/portal-project-kind";
import { studioEmailSet } from "@/lib/portal-studio-users";
import { buildStudioProjectCard } from "@/lib/studio-dashboard-project";
import { portalKindLabel } from "@/lib/portal-project-kind";
import {
  isPersonaSlug,
  PERSONA_DASHBOARD_PUBLIC_ROLE,
  PERSONA_WELCOME_NAME,
  type PersonaSlug,
} from "@/lib/studio-team-config";
import { loadStudioAdminUserOptions } from "@/lib/studio-admin-options";
import { resolvePersonaProfilePhoto } from "@/lib/team-headshots";
import {
  canDismissAgencyInboxCalendarItem,
  canDismissAgencyInboxThreadItem,
  filterAwaitingReplyWithDismissals,
  filterCalendarFeedbackWithDismissals,
  studioInboxCalendarDismissReadOk,
  studioInboxThreadDismissReadOk,
} from "@/lib/studio-agency-inbox-dismiss";
import { studioInboxAwaitingReplyVisibleToViewer } from "@/lib/studio-team-mentions";
import { runSocialUpcomingMonthFillReminders } from "@/lib/social-may-month-reminder";
import type { MentionMember } from "@/lib/studio-team-mentions";
import { StudioDueCalendar, type StudioCalendarEvent, type StudioCalendarTimeOff } from "@/components/portal/StudioDueCalendar";
import {
  agencyTodoDeepHref,
  splitTrailingTaskTitle,
} from "@/lib/studio-agency-todo-href";
import { agencyDateYmd } from "@/lib/agency-todo-dates";

/** "Client name — task detail" pattern used in many agency todo titles and project names. */
function splitLeadingClientLabel(text: string): { label: string; remainder: string | null } {
  const sep = " - ";
  const i = text.indexOf(sep);
  if (i === -1) return { label: text.trim(), remainder: null };
  const label = text.slice(0, i).trim();
  const remainder = text.slice(i + sep.length).trim();
  if (!label) return { label: text.trim(), remainder: null };
  return { label, remainder: remainder || null };
}

function isCompletedToday(d: Date | null, todayYmd: string): boolean {
  if (!d) return false;
  return agencyDateYmd(d) === todayYmd;
}

function todoSortKey(t: { dueDate: Date | null }, todayYmd: string): number {
  if (!t.dueDate) return 4;
  const y = agencyDateYmd(t.dueDate);
  if (y < todayYmd) return 0;
  if (y === todayYmd) return 1;
  return 2;
}

function shouldRenderProjectCard(card: ReturnType<typeof buildStudioProjectCard>): boolean {
  if (!card.name.trim()) return false;
  const unassigned = !card.clientLabel.trim() || card.clientLabel === "Unassigned";
  if (!unassigned) return true;
  if (card.statusTone !== "ok") return true;
  if (card.overallPercent > 0) return true;
  return card.tracks.some((t) => t.percent > 0);
}

function dashboardNextFocusForViewer(slug: PersonaSlug, nextFocus: string): string {
  if (slug === "isabella") return nextFocus;
  const lower = nextFocus.toLowerCase();
  if (lower.includes("contract") || lower.includes("deposit") || lower.includes("full client hub")) {
    return "Client hub access is still being finalized — check with Operations if you need clarity.";
  }
  return nextFocus;
}

type Props = { userId: string; createdBanner?: "single" | "pair" | null };

export async function StudioAgencyDashboard({ userId, createdBanner = null }: Props) {
  await runSocialUpcomingMonthFillReminders();

  const [member, viewer] = await Promise.all([
    prisma.studioTeamMember.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
  ]);

  if (!viewer?.email || !isStudioUser(viewer.email)) {
    return null;
  }

  const now = new Date();
  const todayYmd = agencyDateYmd(now);

  const openTodos = await prisma.agencyTodo.findMany({
    where: { assigneeUserId: userId, completedAt: null },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      project: {
        select: {
          id: true,
          name: true,
          portalKind: true,
          user: { select: { businessName: true, name: true } },
        },
      },
    },
  });

  const doneToday = await prisma.agencyTodo.findMany({
    where: {
      assigneeUserId: userId,
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
    take: 200,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          portalKind: true,
          user: { select: { businessName: true, name: true } },
        },
      },
    },
  });
  const doneTodayFiltered = doneToday.filter((t) => t.completedAt && isCompletedToday(t.completedAt, todayYmd));

  const timeOffRows = await prisma.studioTimeOff.findMany({
    where: {
      userId,
      endDate: { gte: new Date(todayYmd + "T00:00:00.000Z") },
    },
    orderBy: { startDate: "asc" },
  });

  /** `personaSlug` is unique per user in DB; generic agency logins may have no row — use Issy-level visibility. */
  const rawPersona = member?.personaSlug ?? null;
  const slug = (rawPersona && isPersonaSlug(rawPersona) ? rawPersona : "isabella") as PersonaSlug;
  const dashboardPublicRole = PERSONA_DASHBOARD_PUBLIC_ROLE[slug];
  const personaFirst = slug in PERSONA_WELCOME_NAME ? PERSONA_WELCOME_NAME[slug as PersonaSlug] : slug;
  const accountFirst =
    member?.user?.name?.trim().split(/\s+/)[0] ||
    viewer.name?.trim().split(/\s+/)[0] ||
    member?.user?.email?.split("@")[0] ||
    viewer.email.split("@")[0] ||
    personaFirst;
  const welcomeFirst = member?.welcomeName?.trim() || accountFirst;
  const profilePhotoSrc = resolvePersonaProfilePhoto(member?.photoUrl ?? null, slug);

  const sortedTodos = [...openTodos].sort((a, b) => {
    const da = todoSortKey(a, todayYmd);
    const db = todoSortKey(b, todayYmd);
    if (da !== db) return da - db;
    const ad = a.dueDate?.getTime() ?? 0;
    const bd = b.dueDate?.getTime() ?? 0;
    if (ad !== bd) return ad - bd;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const [
    projectsRaw,
    calendarPosts,
    studioNotifications,
    teamChatRaw,
    teamMembersForHints,
    projectsForReplyCheck,
    calendarFeedbackRaw,
    inboxDismissals,
  ] = await Promise.all([
    prisma.project.findMany({
      where: projectWhereVisibleToStudioMemberOnDashboard(userId, slug),
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, businessName: true, email: true } },
        assignedStudioUser: {
          select: {
            email: true,
            name: true,
            studioTeamProfile: { select: { welcomeName: true } },
          },
        },
        calendarItems: {
          select: { clientSignedOff: true, scheduledFor: true, postWorkflowStatus: true },
        },
        reviewAssets: { select: { kind: true, clientSignedOff: true, filePath: true } },
        websitePageBriefs: {
          select: { pageIndex: true, headline: true, bodyCopy: true, imagePaths: true },
        },
      },
    }),
    prisma.contentCalendarItem.findMany({
      where: {
        scheduledFor: { not: null },
        project: {
          studioMarkedCompleteAt: null,
          portalKind: { in: [...PORTAL_KINDS_WITH_SOCIAL] },
          ...projectWhereStudioMayViewSocialCalendar(userId, slug),
        },
      },
      select: {
        id: true,
        scheduledFor: true,
        title: true,
        caption: true,
        clientSignedOff: true,
        projectId: true,
        project: { select: { name: true } },
      },
    }),
    prisma.studioNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.studioTeamChatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        body: true,
        createdAt: true,
        authorUserId: true,
        mentionedUserIds: true,
        author: {
          select: {
            name: true,
            email: true,
            studioTeamProfile: { select: { welcomeName: true, personaSlug: true, photoUrl: true } },
          },
        },
      },
    }),
    prisma.studioTeamMember.findMany({
      select: {
        userId: true,
        personaSlug: true,
        welcomeName: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.project.findMany({
      where: {
        studioMarkedCompleteAt: null,
        messages: { some: {} },
        ...projectWhereVisibleToStudioMemberOnDashboard(userId, slug),
      },
      select: {
        id: true,
        name: true,
        portalKind: true,
        assignedStudioUserId: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, authorRole: true, body: true, createdAt: true, authorName: true },
        },
      },
    }),
    prisma.contentCalendarItem.findMany({
      where: {
        clientSignedOff: false,
        clientFeedback: { not: null },
        project: {
          studioMarkedCompleteAt: null,
          portalKind: { in: [...PORTAL_KINDS_WITH_SOCIAL] },
          ...projectWhereStudioMayViewSocialCalendar(userId, slug),
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: {
        id: true,
        clientFeedback: true,
        title: true,
        caption: true,
        projectId: true,
        updatedAt: true,
        project: { select: { name: true, assignedStudioUserId: true, portalKind: true } },
      },
    }),
    prisma.studioAgencyInboxDismissal.findMany({
      where: { userId },
    }),
  ]);

  const notificationProjectIds = Array.from(
    new Set(
      studioNotifications
        .filter((n) => n.kind === "CLIENT_MESSAGE" || n.kind === "CALENDAR_FEEDBACK")
        .map((n) => projectIdFromStudioNotificationHref(n.href))
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const notificationProjects =
    notificationProjectIds.length > 0
      ? await prisma.project.findMany({
          where: { id: { in: notificationProjectIds } },
          select: { id: true, portalKind: true, assignedStudioUserId: true },
        })
      : [];
  const notificationProjectById = new Map(notificationProjects.map((p) => [p.id, p]));

  const notificationsForUi = studioNotifications.filter((n) => {
    if (n.kind === "TEAM_MENTION") return true;
    if (n.kind !== "CLIENT_MESSAGE" && n.kind !== "CALENDAR_FEEDBACK") return true;
    const pid = projectIdFromStudioNotificationHref(n.href);
    if (!pid) return false;
    const p = notificationProjectById.get(pid);
    if (!p) return false;
    return studioMemberMayAccessProject(p, userId, slug);
  });

  const inboxUnreadCount = notificationsForUi.filter((n) => !n.readAt).length;
  const mentionMembersForInbox: MentionMember[] = teamMembersForHints.map((m) => ({
    userId: m.userId,
    personaSlug: m.personaSlug,
    welcomeName: m.welcomeName,
    user: m.user,
  }));
  const awaitingReplyVisible = projectsForReplyCheck.filter((p) => {
    const last = p.messages[0];
    if (last?.authorRole !== "CLIENT") return false;
    return studioInboxAwaitingReplyVisibleToViewer(
      last.body,
      userId,
      { portalKind: p.portalKind, assignedStudioUserId: p.assignedStudioUserId },
      slug,
      mentionMembersForInbox,
    );
  });
  const awaitingReply = filterAwaitingReplyWithDismissals(awaitingReplyVisible, inboxDismissals);
  const calendarFeedbackQueueRaw = calendarFeedbackRaw.filter((c) => c.clientFeedback?.trim());
  const calendarFeedbackQueue = filterCalendarFeedbackWithDismissals(calendarFeedbackQueueRaw, inboxDismissals);

  const notificationRowsForRead = notificationsForUi.map((n) => ({
    kind: n.kind,
    href: n.href,
    readAt: n.readAt,
    createdAt: n.createdAt,
  }));

  const threadInboxRows: ThreadInboxRowUi[] = awaitingReply.map((p) => {
    const last = p.messages[0]!;
    return {
      projectId: p.id,
      projectName: p.name,
      lastMessage: {
        id: last.id,
        body: last.body,
        authorName: last.authorName,
        createdAt: last.createdAt.toISOString(),
      },
      dismissAllowed: canDismissAgencyInboxThreadItem(slug, userId, p),
      dismissEnabled: studioInboxThreadDismissReadOk(p.id, notificationRowsForRead),
    };
  });

  const calendarInboxRows: CalendarInboxRowUi[] = calendarFeedbackQueue.map((c) => ({
    id: c.id,
    projectId: c.projectId,
    projectName: c.project.name,
    postLabel: (c.title?.trim() || c.caption.trim()).slice(0, 100) || "Post",
    clientFeedback: c.clientFeedback?.trim() ?? "",
    updatedAtIso: c.updatedAt.toISOString(),
    dismissAllowed: canDismissAgencyInboxCalendarItem(slug, userId, c.project),
    dismissEnabled: studioInboxCalendarDismissReadOk(c.id, notificationRowsForRead),
  }));

  const showNewProjectForm = slug === "isabella" || slug === "harriet";
  const studioExcludeEmails = Array.from(studioEmailSet());

  const [newProjectClients, newProjectStudioAdmins] = showNewProjectForm
    ? await Promise.all([
        prisma.user.findMany({
          where: {
            passwordHash: { not: null },
            ...(studioExcludeEmails.length > 0 ? { NOT: { email: { in: studioExcludeEmails } } } : {}),
          },
          orderBy: { email: "asc" },
          select: { id: true, email: true, name: true, businessName: true },
        }),
        loadStudioAdminUserOptions(),
      ])
    : [[], []];

  const pendingClientInvites =
    slug === "isabella"
      ? await prisma.user.findMany({
          where: {
            passwordHash: null,
            ...(studioExcludeEmails.length > 0 ? { email: { notIn: studioExcludeEmails } } : {}),
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            name: true,
            clientInviteSentAt: true,
            clientInviteExpiresAt: true,
            projects: {
              where: { studioMarkedCompleteAt: null },
              select: { id: true, name: true },
              take: 12,
            },
          },
          orderBy: { clientInviteSentAt: "desc" },
          take: 40,
        })
      : [];

  const teamChatChronological = [...teamChatRaw].reverse();
  const teamChatForUi = teamChatChronological;

  const ongoing = projectsRaw.filter((p) => !p.studioMarkedCompleteAt);
  const completed = projectsRaw.filter((p) => p.studioMarkedCompleteAt);

  const projectCardsOngoing = ongoing
    .map((p) => buildStudioProjectCard(p, p.calendarItems, p.reviewAssets, p.websitePageBriefs, now))
    .filter(shouldRenderProjectCard);
  const projectCardsDone = completed
    .map((p) => buildStudioProjectCard(p, p.calendarItems, p.reviewAssets, p.websitePageBriefs, now))
    .filter(shouldRenderProjectCard);

  const todosByProject = new Map<string, typeof openTodos>();
  for (const t of openTodos) {
    if (!t.projectId) continue;
    const list = todosByProject.get(t.projectId) ?? [];
    list.push(t);
    todosByProject.set(t.projectId, list);
  }

  const calendarEvents: StudioCalendarEvent[] = [];
  for (const t of openTodos) {
    if (!t.dueDate) continue;
    calendarEvents.push({
      id: `todo-${t.id}`,
      kind: "todo",
      at: t.dueDate.toISOString(),
      title: t.title,
      projectId: t.projectId ?? "",
      projectName: t.project?.name ?? "General",
      href:
        t.projectId != null
          ? agencyTodoDeepHref(t.projectId, t.kind, t.project?.portalKind)
          : "/portal",
    });
  }
  for (const c of calendarPosts) {
    if (!c.scheduledFor) continue;
    const cap = typeof c.caption === "string" ? c.caption : "";
    const label = (c.title?.trim() || cap.trim()).slice(0, 120) || "Scheduled post";
    calendarEvents.push({
      id: `post-${c.id}`,
      kind: "post",
      at: c.scheduledFor.toISOString(),
      title: label,
      projectId: c.projectId,
      projectName: c.project.name,
      href: `/portal/project/${c.projectId}/social`,
      done: c.clientSignedOff,
    });
  }

  const calendarTimeOff: StudioCalendarTimeOff[] = timeOffRows.map((r) => ({
    id: r.id,
    start: r.startDate.toISOString(),
    end: r.endDate.toISOString(),
    note: r.note,
  }));

  return (
    <div className="space-y-12">
      {slug === "isabella" && pendingClientInvites.some((u) => u.projects.length > 0) ? (
        <section
          className="cc-portal-client-shell scroll-mt-28 border border-sky-200/80 bg-sky-50/40"
          aria-labelledby="pending-invites-heading"
        >
          <h2
            id="pending-invites-heading"
            className="font-display text-lg tracking-[-0.02em] text-burgundy md:text-xl"
          >
            Pending client invites
          </h2>
          <p className="mt-2 max-w-3xl font-body text-sm text-burgundy/65">
            These clients have a project but haven&apos;t finished portal registration yet. Open the project to resend
            their invite if the link expired.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {pendingClientInvites
              .filter((u) => u.projects.length > 0)
              .map((u) => (
                <li
                  key={u.id}
                  className="rounded-xl border border-zinc-200/90 bg-white px-4 py-3 font-body text-sm text-burgundy"
                >
                  <span className="font-medium">{u.firstName?.trim() || u.name?.trim() || "Client"}</span>
                  <span className="text-burgundy/45"> · </span>
                  <span className="break-all font-mono text-[13px]">{u.email}</span>
                  {u.clientInviteSentAt ? (
                    <span className="mt-1 block text-[12px] text-burgundy/55">
                      Invite sent{" "}
                      {u.clientInviteSentAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                      {u.clientInviteExpiresAt && u.clientInviteExpiresAt.getTime() <= Date.now() ? (
                        <span className="font-medium text-amber-900"> · Link expired — resend from project</span>
                      ) : null}
                    </span>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {u.projects.map((p) => (
                      <Link
                        key={p.id}
                        href={`/portal/project/${p.id}#agency-project-header`}
                        className="inline-flex rounded-full border border-burgundy/25 bg-burgundy/[0.06] px-3 py-1 text-[12px] font-semibold text-burgundy no-underline hover:bg-burgundy/10"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
      {createdBanner === "pair" ? (
        <div
          className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-5 py-4 font-body text-sm leading-relaxed text-burgundy shadow-sm"
          role="status"
        >
          Done — you created <strong className="font-medium text-burgundy">two</strong> projects (website + social).
          They appear as separate subscriptions on the client&apos;s portal home.
        </div>
      ) : createdBanner === "single" ? (
        <div
          className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-5 py-4 font-body text-sm leading-relaxed text-burgundy shadow-sm"
          role="status"
        >
          Nice — your new project is in the list below. Open it whenever you&apos;re ready to add details or verify your
          client.
        </div>
      ) : null}
      <div className="space-y-4 sm:space-y-5">
        <section
          id="studio-welcome"
          className="cc-portal-client-shell scroll-mt-28 w-full"
          aria-labelledby="welcome-heading"
        >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10 xl:gap-12">
          <div className="flex shrink-0 justify-center lg:justify-start">
            {profilePhotoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-supplied or default site headshot path
              <img
                src={profilePhotoSrc}
                alt={`${welcomeFirst} profile`}
                className="h-20 w-20 rounded-full object-cover object-top ring-2 ring-zinc-300/80 ring-offset-2 ring-offset-cream sm:h-24 sm:w-24 lg:h-[5.5rem] lg:w-[5.5rem]"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 font-display text-2xl tracking-[-0.04em] text-burgundy ring-2 ring-zinc-300/80 ring-offset-2 ring-offset-cream sm:h-24 sm:w-24 sm:text-3xl lg:h-[5.5rem] lg:w-[5.5rem] lg:text-4xl"
                aria-hidden
              >
                {welcomeFirst.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 lg:py-1">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
              <h2
                id="welcome-heading"
                className="m-0 text-center font-display text-2xl font-normal tracking-[-0.03em] text-burgundy sm:text-3xl lg:text-left"
              >
                Good to see you, {welcomeFirst}
              </h2>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href="#studio-welcome"
                  className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy outline-offset-4 transition-colors hover:bg-burgundy/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-burgundy"
                  aria-label="Dashboard overview"
                >
                  <DashIconHome className="h-5 w-5 transition-colors group-hover:text-burgundy" />
                </a>
                <a
                  href="#studio-comms"
                  className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy outline-offset-4 transition-colors hover:bg-burgundy/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-burgundy"
                  aria-label={
                    inboxUnreadCount > 0
                      ? `Notifications and inbox, ${inboxUnreadCount} unread`
                      : "Notifications and inbox"
                  }
                >
                  <DashIconInbox className="h-5 w-5 transition-colors group-hover:text-burgundy" />
                  <span
                    className={`absolute -right-1 -top-1 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full px-1 font-body text-[10px] font-bold leading-none ring-2 ring-white/90 ${
                      inboxUnreadCount > 0 ? "bg-burgundy text-cream" : "bg-burgundy/15 text-burgundy/55"
                    }`}
                    aria-hidden
                  >
                    {inboxUnreadCount > 99 ? "99+" : inboxUnreadCount}
                  </span>
                </a>
              </div>
            </div>
            <p className="mt-2 text-center font-body text-sm text-burgundy/60 lg:text-left">{dashboardPublicRole}</p>
            <p className="mx-auto mt-4 max-w-2xl text-center font-body text-sm leading-relaxed text-burgundy/70 md:text-[15px] lg:mx-0 lg:max-w-none lg:text-left">
              Use the shortcuts in the bar below to jump anywhere. Your tasks follow next, then inbox &amp; team, then
              calendar and clients. There&apos;s no rush — open anything when it feels right.
            </p>
          </div>

          <div className="flex min-w-0 shrink-0 flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-center sm:pt-6 lg:w-[min(100%,17rem)] lg:flex-col lg:items-stretch lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:w-[min(100%,19rem)]">
            <a
              href="#studio-projects"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 py-2.5 font-body text-sm font-semibold text-burgundy transition-colors hover:border-zinc-400 hover:bg-zinc-50 sm:w-auto lg:w-full"
            >
              Browse client projects
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
        </section>

        <StudioDashboardSectionNav
          inboxUnreadCount={inboxUnreadCount}
          showNewProjectLink={showNewProjectForm}
        />
      </div>

      <section
        id="studio-todos"
        className="cc-portal-client-shell scroll-mt-28 w-full"
        aria-labelledby="todos-heading"
      >
          <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
            <div className="min-w-0 sm:max-w-[75%]">
              <div className="flex items-start gap-3 sm:gap-4">
                <StudioSectionIcon Icon={DashIconTasks} className="max-sm:mt-0.5" />
                <div className="min-w-0">
                  <h2 id="todos-heading" className="font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl">
                    Your tasks
                  </h2>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-burgundy/60">
                    Need-attention and due-today items float to the top; everything else follows in date order. Dates
                    are whatever you (or the portal) set on each task.
                  </p>
                </div>
              </div>
            </div>
            <p className="shrink-0 rounded-full bg-burgundy px-3 py-1.5 font-body text-xs font-medium text-cream shadow-sm">
              {openTodos.length === 0
                ? `All caught up${doneTodayFiltered.length > 0 ? ` · ${doneTodayFiltered.length} done today` : ""}`
                : `${openTodos.length} waiting${doneTodayFiltered.length > 0 ? ` · ${doneTodayFiltered.length} done today` : ""}`}
            </p>
          </div>

          {sortedTodos.length === 0 ? (
            <p className="mt-2 font-body text-sm leading-relaxed text-burgundy/65">
              Nothing waiting on you — enjoy the quiet, or drop yourself a reminder below whenever you like.
            </p>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-2 2xl:grid-cols-2 2xl:gap-3">
              {sortedTodos.map((t) => (
                <TodoRow key={t.id} todo={t} todayYmd={todayYmd} />
              ))}
            </ul>
          )}

          {doneTodayFiltered.length > 0 ? (
            <div className="mt-10 pt-8">
              <h3 className="font-display text-lg tracking-[-0.02em] text-burgundy">Nice work today</h3>
              <p className="mt-1 font-body text-sm text-burgundy/55">You&apos;ve already ticked these off.</p>
              <ul className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
                {doneTodayFiltered.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      {(() => {
                        const { clientLinkLabel, taskLine } = parseStudioTodoHeadline(t);
                        const workHref = t.project ? agencyTodoDeepHref(t.project.id, t.kind, t.project.portalKind) : null;
                        const showTask = Boolean(taskLine && taskLine !== clientLinkLabel);
                        return (
                          <>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              {workHref && clientLinkLabel ? (
                                <Link
                                  href={workHref}
                                  className="font-display text-sm font-semibold tracking-[-0.02em] text-burgundy/70 underline-offset-2 hover:text-burgundy hover:underline"
                                >
                                  {clientLinkLabel}
                                </Link>
                              ) : clientLinkLabel ? (
                                <span className="font-display text-sm font-semibold tracking-[-0.02em] text-burgundy/50 line-through">
                                  {clientLinkLabel}
                                </span>
                              ) : null}
                            </div>
                            {showTask ? (
                              <p className="m-0 mt-1 font-body text-sm text-burgundy/40 line-through">{taskLine}</p>
                            ) : null}
                            {!showTask && !clientLinkLabel ? (
                              <p className="m-0 font-body text-sm text-burgundy/45 line-through">{t.title}</p>
                            ) : null}
                          </>
                        );
                      })()}
                    </div>
                    <AgencyDashboardCompletedTodoActions todoId={t.id} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10 pt-8">
            <h3 className="font-display text-lg tracking-[-0.02em] text-burgundy">Add something for yourself</h3>
            <p className="mt-1 font-body text-sm text-burgundy/55">A small reminder — only you see it here.</p>
            <AgencyDashboardAddTodoForm />
          </div>
        </section>

      <StudioAgencyCommsPanels
        notifications={notificationsForUi}
        threadInboxRows={threadInboxRows}
        calendarInboxRows={calendarInboxRows}
        teamChatMessages={teamChatForUi}
        teamMembersForHints={teamMembersForHints}
      />

      <section
        id="studio-calendar"
        className="cc-portal-client-shell scroll-mt-28"
        aria-labelledby="calendar-heading"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <StudioSectionIcon Icon={DashIconCalendar} className="max-sm:mt-0.5" />
          <div className="min-w-0">
            <h2 id="calendar-heading" className="font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl">
              Calendar
            </h2>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-burgundy/65">
              Your open tasks with due dates and scheduled social posts on projects you can access. Use the month
              controls to plan ahead; the summary below lists what&apos;s dated this month.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <StudioDueCalendar events={calendarEvents} timeOff={calendarTimeOff} />
        </div>
      </section>

      <section id="studio-projects" className="scroll-mt-28 space-y-6" aria-labelledby="projects-heading">
        <div className="flex items-start gap-3 sm:gap-4">
          <StudioSectionIcon Icon={DashIconProjects} className="max-sm:mt-0.5" />
          <div className="min-w-0">
            <h2 id="projects-heading" className="font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl">
              Clients you&apos;re working with
            </h2>
            <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-burgundy/62">
              Each card is a snapshot of that project — what&apos;s live, what&apos;s next — based on the workstreams
              in play. Open the project for the full picture.
            </p>
          </div>
        </div>

        {projectCardsOngoing.length === 0 ? (
          <p className="cc-portal-client-empty py-10 text-center font-body text-sm text-burgundy/70">
            {slug === "isabella"
              ? "No active projects on the roster yet — add one from New project when you are ready."
              : slug === "harriet"
                ? "Nothing assigned to you yet. When you are set as the lead on a project, it will show up here."
                : "No social projects assigned to you yet. When you are the lead on a social subscription, it will show up here."}
          </p>
        ) : (
          <div className="grid auto-rows-fr items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projectCardsOngoing.map((card) => (
              <div key={card.id} className="flex min-h-0 h-full">
                <ProjectCard card={card} todos={todosByProject.get(card.id) ?? []} viewerPersona={slug} />
              </div>
            ))}
          </div>
        )}

        {projectCardsDone.length > 0 ? (
          <details className="cc-portal-client-shell">
            <summary className="cursor-pointer list-none font-display text-lg tracking-[-0.02em] text-burgundy marker:content-none [&::-webkit-details-marker]:hidden">
              Wrapped-up projects ({projectCardsDone.length})
            </summary>
            <div className="mt-5 grid auto-rows-fr items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {projectCardsDone.map((card) => (
                <div key={card.id} className="flex min-h-0 h-full">
                  <ProjectCard card={card} todos={todosByProject.get(card.id) ?? []} viewerPersona={slug} />
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </section>

      {showNewProjectForm ? (
        <section
          id="studio-new-project"
          className="cc-portal-client-shell scroll-mt-28"
          aria-labelledby="create-project-heading"
        >
          <h2 id="create-project-heading" className="cc-portal-client-shell-title">
            Start a new project
          </h2>
          <p className="cc-portal-client-description mt-3 max-w-xl font-medium">
            Choose someone who already has a login, or invite by email — when they sign up with that address, the project
            appears for them automatically. Pick the project type and set the studio lead as you prefer.
          </p>
          <AgencyCreateProjectForm
            clients={newProjectClients}
            studioAdmins={newProjectStudioAdmins}
            creatorPersonaSlug={slug}
          />
        </section>
      ) : null}
    </div>
  );
}

function ProgressBar({ label, percent }: { label: string; percent: number }) {
  const w = Math.min(100, Math.max(0, percent));
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-xs font-medium text-burgundy/75">{label}</span>
        <span className="shrink-0 font-body text-xs tabular-nums font-medium text-burgundy">{w}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-burgundy/15">
        <div
          className="h-full rounded-full bg-burgundy transition-[width] duration-500"
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

function parseStudioTodoHeadline(input: {
  title: string;
  project: {
    name: string;
    user: { businessName: string | null; name: string | null } | null;
  } | null;
}): { clientLinkLabel: string; taskLine: string | null } {
  const clientFromAccount =
    input.project?.user?.businessName?.trim() || input.project?.user?.name?.trim() || null;
  const fullTitle = input.title.trim();

  const leading = splitLeadingClientLabel(input.title);
  if (leading.remainder !== null) {
    return {
      clientLinkLabel: clientFromAccount || leading.label,
      taskLine: leading.remainder,
    };
  }

  const tr = splitTrailingTaskTitle(input.title);
  if (tr.trailing) {
    return {
      clientLinkLabel: clientFromAccount || tr.trailing || input.project?.name?.trim() || tr.summary,
      taskLine: tr.summary,
    };
  }

  const name = clientFromAccount || input.project?.name?.trim() || "";
  if (!name) {
    return { clientLinkLabel: "", taskLine: fullTitle || null };
  }
  return {
    clientLinkLabel: name,
    taskLine: fullTitle && fullTitle !== name ? fullTitle : null,
  };
}

function TodoRow({
  todo,
  todayYmd,
}: {
  todo: {
    id: string;
    kind: string;
    title: string;
    body: string;
    dueDate: Date | null;
    project: {
      id: string;
      name: string;
      portalKind: string;
      user: { businessName: string | null; name: string | null } | null;
    } | null;
  };
  todayYmd: string;
}) {
  let dueBadge: string | null = null;
  let dueClass = "border border-burgundy/30 bg-white text-burgundy";
  if (todo.dueDate) {
    const y = agencyDateYmd(todo.dueDate);
    if (y < todayYmd) {
      dueBadge = `Overdue · ${y}`;
      dueClass = "border border-amber-800/30 bg-amber-50 text-amber-950";
    } else if (y === todayYmd) {
      dueBadge = "Due today";
      dueClass = "bg-burgundy text-cream";
    } else {
      dueBadge = `Due ${y}`;
      dueClass = "border border-burgundy/30 bg-white text-burgundy";
    }
  }

  const { clientLinkLabel, taskLine } = parseStudioTodoHeadline(todo);
  const workHref = todo.project ? agencyTodoDeepHref(todo.project.id, todo.kind, todo.project.portalKind) : null;
  const showTaskLine = Boolean(taskLine && taskLine !== clientLinkLabel);

  const clientNamePill =
    "inline-flex max-w-full min-w-0 items-center rounded-full border border-zinc-200/90 bg-white px-3 py-1.5 font-display text-base font-normal leading-tight tracking-[-0.02em] text-burgundy shadow-sm transition-colors hover:border-burgundy/40 hover:bg-burgundy/[0.04] sm:text-lg";
  const clientNamePillLink = `${clientNamePill} underline-offset-4 hover:underline`;

  return (
    <li className="rounded-xl border border-zinc-200/90 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {workHref && clientLinkLabel ? (
              <Link href={workHref} className={clientNamePillLink}>
                <span className="min-w-0 truncate">{clientLinkLabel}</span>
                <span className="sr-only"> — open where to work on this task</span>
              </Link>
            ) : clientLinkLabel ? (
              <span className={clientNamePill}>
                <span className="min-w-0 truncate">{clientLinkLabel}</span>
              </span>
            ) : null}
            {dueBadge ? (
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-body text-[11px] font-medium ${dueClass}`}>
                {dueBadge}
              </span>
            ) : null}
          </div>
          {showTaskLine ? (
            <p className="m-0 mt-2 min-w-0 font-body text-sm font-medium leading-snug text-burgundy/85">{taskLine}</p>
          ) : null}
          {!showTaskLine && !clientLinkLabel ? (
            <p className="m-0 min-w-0 font-body text-sm font-medium leading-snug text-burgundy">{todo.title}</p>
          ) : null}
          {todo.body ? (
            <p className="mt-2 line-clamp-2 whitespace-pre-wrap font-body text-[13px] leading-relaxed text-burgundy/60">
              {todo.body}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <form action={completeAgencyTodo} className="shrink-0">
            <input type="hidden" name="todoId" value={todo.id} />
            <button
              type="submit"
              className="rounded-full bg-burgundy px-4 py-2 font-body text-xs font-semibold text-cream shadow-sm transition-opacity hover:opacity-90"
            >
              Mark done
            </button>
          </form>
          <AgencyTodoDeleteConfirmButton
            todoId={todo.id}
            isAutoReminder={todo.kind.startsWith("AUTO:")}
          />
        </div>
      </div>
    </li>
  );
}

function ProjectCard({
  card,
  todos,
  viewerPersona,
}: {
  card: ReturnType<typeof buildStudioProjectCard>;
  viewerPersona: PersonaSlug;
  todos: {
    id: string;
    kind: string;
    title: string;
    body: string;
    dueDate: Date | null;
    project: {
      id: string;
      name: string;
      portalKind: string;
      user: { businessName: string | null; name: string | null } | null;
    } | null;
  }[];
}) {
  const statusStyles = {
    ok: "bg-burgundy text-cream",
    pending: "border-2 border-burgundy/40 bg-amber-50 text-amber-950",
    invite: "border-2 border-burgundy bg-burgundy/10 text-burgundy",
  } as const;

  const nextFocusDisplay = dashboardNextFocusForViewer(viewerPersona, card.nextFocus);

  return (
    <article className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm transition-shadow sm:p-6 md:hover:border-zinc-300 md:hover:shadow-md">
      <header className="shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/portal/project/${card.id}`}
              className="font-display text-lg leading-tight tracking-[-0.02em] text-burgundy underline-offset-4 hover:underline md:text-xl"
            >
              {card.name}
            </Link>
            <p className="mt-1.5 font-body text-[13px] font-medium text-burgundy/55">{portalKindLabel(card.portalKind)}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1.5 font-body text-[11px] font-semibold leading-none ${statusStyles[card.statusTone]}`}
          >
            {card.statusText}
          </span>
        </div>
        <p className="mt-3 break-words font-body text-[13px] leading-relaxed text-burgundy/70">{card.clientLabel}</p>
        {card.assignedLeadLabel ? (
          <p className="mt-1.5 font-body text-[11px] font-medium text-burgundy/50">
            Admin lead · {card.assignedLeadLabel}
          </p>
        ) : null}
      </header>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-5">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-body text-xs font-semibold text-burgundy/65">Overall progress</span>
            <span className="font-display text-lg tabular-nums tracking-[-0.03em] text-burgundy md:text-xl">
              {card.overallPercent}%
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-burgundy/15">
            <div
              className="h-full rounded-full bg-burgundy transition-[width] duration-500"
              style={{ width: `${card.overallPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {card.tracks.map((t) => (
            <ProgressBar key={t.key} label={t.label} percent={t.percent} />
          ))}
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-3">
          <p className="m-0 font-body text-[13px] leading-relaxed text-burgundy/80">
            <span className="font-semibold text-burgundy">Next step · </span>
            {nextFocusDisplay}
          </p>
        </div>

        <div>
          <h4 className="m-0 font-body text-xs font-semibold uppercase tracking-[0.06em] text-burgundy/50">Your tasks</h4>
          {todos.length === 0 ? (
            <p className="mt-2 font-body text-[13px] leading-relaxed text-burgundy/55">Nothing queued for this client.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {todos.map((t) => {
                const { clientLinkLabel, taskLine } = parseStudioTodoHeadline(t);
                const workHref = t.project ? agencyTodoDeepHref(t.project.id, t.kind, t.project.portalKind) : null;
                const showTask = Boolean(taskLine && taskLine !== clientLinkLabel);
                return (
                  <li key={t.id} className="rounded-xl border border-zinc-200/90 bg-zinc-50/40 px-3 py-2.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="min-w-0">
                          {workHref && clientLinkLabel ? (
                            <Link
                              href={workHref}
                              className="font-display text-[13px] font-semibold leading-snug tracking-[-0.02em] text-burgundy underline-offset-2 hover:underline"
                            >
                              {clientLinkLabel}
                            </Link>
                          ) : clientLinkLabel ? (
                            <span className="font-display text-[13px] font-semibold tracking-[-0.02em] text-burgundy">
                              {clientLinkLabel}
                            </span>
                          ) : null}
                          {showTask ? (
                            <p className="m-0 mt-1 font-body text-[12px] font-medium leading-snug text-burgundy/75 line-clamp-2">
                              {taskLine}
                            </p>
                          ) : null}
                          {!showTask && !clientLinkLabel ? (
                            <p className="m-0 font-body text-[13px] font-medium leading-snug text-burgundy line-clamp-3">
                              {t.title}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
                        <span className="font-body text-[11px] font-medium tabular-nums text-burgundy/50">
                          {t.dueDate ? agencyDateYmd(t.dueDate) : "No date"}
                        </span>
                        <form action={completeAgencyTodo}>
                          <input type="hidden" name="todoId" value={t.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-burgundy px-3 py-1.5 font-body text-[11px] font-semibold text-cream shadow-sm hover:opacity-90"
                          >
                            Done
                          </button>
                        </form>
                        <AgencyTodoDeleteConfirmButton
                          todoId={t.id}
                          isAutoReminder={t.kind.startsWith("AUTO:")}
                          compact
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-auto w-full shrink-0 pt-5 sm:pt-6">
        <Link
          href={`/portal/project/${card.id}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-burgundy py-3 font-body text-sm font-semibold text-cream shadow-sm transition-opacity hover:opacity-90"
        >
          Go to project
        </Link>
      </div>
    </article>
  );
}
