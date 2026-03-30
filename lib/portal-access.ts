import type { Prisma, Project } from "@prisma/client";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { normalizePortalKind, PORTAL_KINDS_ISSY_PROJECT_SCOPE } from "@/lib/portal-project-kind";
import { studioEmailSet } from "@/lib/portal-studio-users";

export function isStudioUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return studioEmailSet().has(email.trim().toLowerCase());
}

/**
 * Social calendar (studio UI: month grid, post list, add post) is limited to the project’s assigned lead
 * (account manager / point of contact). If no lead is set yet, any studio login may access so small teams
 * aren’t blocked — except the **May** persona, who only sees calendars for projects explicitly assigned to her.
 */
export function studioMayAccessProjectSocialCalendar(
  project: { assignedStudioUserId: string | null },
  studioUserId: string | null | undefined,
  viewerPersonaSlug?: string | null,
): boolean {
  if (!studioUserId) return false;
  /** Issy does not use the social content calendar. */
  if (viewerPersonaSlug === "isabella") return false;
  if (viewerPersonaSlug === "may") {
    return project.assignedStudioUserId === studioUserId;
  }
  if (!project.assignedStudioUserId) return true;
  return project.assignedStudioUserId === studioUserId;
}

/**
 * Prisma filter on nested `project` for calendar aggregations — same visibility as the studio dashboard.
 */
export function projectWhereStudioMayViewSocialCalendar(
  studioUserId: string,
  viewerPersonaSlug?: string | null,
) {
  return projectWhereVisibleToStudioMemberOnDashboard(studioUserId, viewerPersonaSlug ?? null);
}

/**
 * Dashboard / deep links: May — **social-only** (`SOCIAL`) projects where she is assignee.
 */
export function projectWhereMaySocialAssigneeDashboard(userId: string) {
  return {
    assignedStudioUserId: userId,
    portalKind: "SOCIAL",
  };
}

/**
 * Issy — website / multi / one-off work, led by Harriet or Issy, or still unassigned (ops pickup).
 * Excludes social-only retainers (May’s lane).
 * @deprecated Prefer `projectWhereVisibleToStudioMemberOnDashboard` (assignee-scoped).
 */
export function projectWhereIsabellaStudioDashboard() {
  return {
    portalKind: { in: [...PORTAL_KINDS_ISSY_PROJECT_SCOPE] },
    OR: [
      { assignedStudioUserId: null },
      {
        assignedStudioUser: {
          studioTeamProfile: { personaSlug: { in: ["harriet", "isabella"] } },
        },
      },
    ],
  };
}

/**
 * Studio dashboard, notifications, and social calendar: project is visible only if this member is the
 * assigned lead, or the project is still unassigned (pick-up pool — social: May+Harriet; other: Issy+Harriet).
 */
export function projectWhereVisibleToStudioMemberOnDashboard(
  studioUserId: string,
  personaSlug: string | null,
): Prisma.ProjectWhereInput {
  if (!personaSlug) {
    return { id: { in: [] } };
  }
  if (personaSlug === "may") {
    return projectWhereMaySocialAssigneeDashboard(studioUserId);
  }
  /** Issy (ops): full visibility across all project types for assignment and oversight. */
  if (personaSlug === "isabella") {
    return {};
  }
  /** Harriet (and any other studio persona): assigned projects only — unassigned queue is Issy’s lane. */
  return {
    assignedStudioUserId: studioUserId,
  };
}

/** Same rules as `projectWhereVisibleToStudioMemberOnDashboard`, for a single project row. */
export function studioMemberMayAccessProject(
  project: { portalKind: string; assignedStudioUserId: string | null },
  studioUserId: string,
  personaSlug: string,
): boolean {
  const k = normalizePortalKind(project.portalKind);
  const aid = project.assignedStudioUserId;

  if (personaSlug === "may") {
    return k === "SOCIAL" && aid === studioUserId;
  }

  /** Issy: every project (including social) for oversight and assigning leads. */
  if (personaSlug === "isabella") {
    return true;
  }

  /** Harriet: creative lead — only projects explicitly assigned to them. */
  return aid === studioUserId;
}

/**
 * Projects shown on /portal for a signed-in client. Scoped strictly by `Project.userId` so clients
 * never see another account’s work. (Invite-only rows have `userId: null` until that client registers.)
 *
 * Returns [] if `userId` is missing — never call Prisma with `undefined` userId (filter would be
 * dropped and could return every project).
 */
export async function listClientOwnedProjects(userId: string | undefined | null): Promise<Project[]> {
  if (!userId || typeof userId !== "string") return [];
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProjectForSession(projectId: string, session: Session | null) {
  if (!session?.user?.id) return null;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: true,
      assignedStudioUser: {
        select: {
          id: true,
          email: true,
          name: true,
          studioTeamProfile: {
            select: { welcomeName: true, personaSlug: true, jobTitle: true, photoUrl: true },
          },
        },
      },
    },
  });
  if (!project) return null;
  if (isStudioUser(session.user.email)) {
    const teamMember = await prisma.studioTeamMember.findUnique({
      where: { userId: session.user.id },
      select: { personaSlug: true },
    });
    const personaSlug = teamMember?.personaSlug;
    /** Require a mapped studio persona (env sync). Prevents unknown studio logins from inheriting Issy-level access. */
    if (!personaSlug) return null;
    if (!studioMemberMayAccessProject(project, session.user.id, personaSlug)) {
      return null;
    }
    return project;
  }
  if (!project.userId || project.userId !== session.user.id) return null;
  // Encrypted vault fields: never expose ciphertext to the client session / RSC props.
  // Never send password hash or invite tokens to the client bundle.
  let safeUser = project.user;
  if (safeUser) {
    const { passwordHash, clientInviteToken, clientInviteExpiresAt, ...rest } = safeUser;
    void passwordHash;
    void clientInviteToken;
    void clientInviteExpiresAt;
    safeUser = rest as typeof project.user;
  }
  return {
    ...project,
    user: safeUser,
    socialAccountAccessEncrypted: null,
    websiteDomainAccessEncrypted: null,
  };
}
