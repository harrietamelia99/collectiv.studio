import type { Prisma, Project } from "@prisma/client";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { normalizePortalKind, PORTAL_KINDS_ISSY_PROJECT_SCOPE } from "@/lib/portal-project-kind";
import { isEnvListedStudioEmail } from "@/lib/portal-studio-users";
import { resolveAgencyRoleForUserId } from "@/lib/resolve-studio-agency-role";
import type { AgencyPortalRole } from "@/lib/studio-team-roles";
import { STUDIO_TEAM_ROLE } from "@/lib/studio-team-roles";

/** True when this session is an agency/studio portal user (JWT `portalRole === "AGENCY"`). */
export function isAgencyPortalSession(session: Session | null | undefined): boolean {
  return session?.user?.portalRole === "AGENCY";
}

/**
 * @deprecated Prefer `isAgencyPortalSession(session)` when a session is available.
 * Synchronous check: email listed in STUDIO_EMAIL only (does not include DB-only team members).
 */
export function isStudioUser(email: string | null | undefined): boolean {
  return isEnvListedStudioEmail(email);
}

/** Agency staff: listed in STUDIO_EMAIL or has a `StudioTeamMember` row (any role). */
export async function emailBelongsToAgencyStaff(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (isEnvListedStudioEmail(e)) return true;
  const u = await prisma.user.findUnique({
    where: { email: e },
    select: { studioTeamProfile: { select: { id: true } } },
  });
  return Boolean(u?.studioTeamProfile);
}

/**
 * Social calendar (studio UI) visibility by agency role.
 * SOCIAL_MANAGER: assigned SOCIAL projects only. Issy: no calendar UI. Harriet: same as legacy non-May studio.
 */
export function studioSocialManagerAccessProjectSocialCalendar(
  project: { assignedStudioUserId: string | null },
  studioUserId: string | null | undefined,
  viewerAgencyRole?: AgencyPortalRole | null,
): boolean {
  if (!studioUserId) return false;
  if (viewerAgencyRole === "ISSY") return false;
  if (viewerAgencyRole === "SOCIAL_MANAGER") {
    return project.assignedStudioUserId === studioUserId;
  }
  if (!project.assignedStudioUserId) return true;
  return project.assignedStudioUserId === studioUserId;
}

/** @deprecated Use `studioSocialManagerAccessProjectSocialCalendar` with `viewerAgencyRole`. */
export const studioMayAccessProjectSocialCalendar = studioSocialManagerAccessProjectSocialCalendar;

export function projectWhereStudioMayViewSocialCalendar(studioUserId: string, viewerAgencyRole?: AgencyPortalRole | null) {
  return projectWhereVisibleToStudioMemberOnDashboard(studioUserId, viewerAgencyRole ?? null);
}

export function projectWhereMaySocialAssigneeDashboard(userId: string) {
  return {
    assignedStudioUserId: userId,
    portalKind: "SOCIAL",
  };
}

export function projectWhereIsabellaStudioDashboard(): Prisma.ProjectWhereInput {
  return {
    portalKind: { in: [...PORTAL_KINDS_ISSY_PROJECT_SCOPE] },
    OR: [
      { assignedStudioUserId: null },
      {
        assignedStudioUser: {
          studioTeamProfile: {
            studioRole: { in: [STUDIO_TEAM_ROLE.HARRIET, STUDIO_TEAM_ROLE.ISSY] },
          },
        },
      },
    ],
  };
}

export function projectWhereVisibleToStudioMemberOnDashboard(
  studioUserId: string,
  agencyRole: AgencyPortalRole | null,
): Prisma.ProjectWhereInput {
  if (!agencyRole) {
    return { id: { in: [] } };
  }
  if (agencyRole === "SOCIAL_MANAGER") {
    return projectWhereMaySocialAssigneeDashboard(studioUserId);
  }
  if (agencyRole === "ISSY") {
    return {};
  }
  return {
    assignedStudioUserId: studioUserId,
  };
}

export function studioMemberMayAccessProject(
  project: { portalKind: string; assignedStudioUserId: string | null },
  studioUserId: string,
  agencyRole: AgencyPortalRole,
): boolean {
  const k = normalizePortalKind(project.portalKind);
  const aid = project.assignedStudioUserId;

  if (agencyRole === "SOCIAL_MANAGER") {
    return k === "SOCIAL" && aid === studioUserId;
  }
  if (agencyRole === "ISSY") {
    return true;
  }
  return aid === studioUserId;
}

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
            select: {
              welcomeName: true,
              personaSlug: true,
              studioRole: true,
              jobTitle: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  });
  if (!project) return null;

  if (isAgencyPortalSession(session)) {
    let agencyRole = session.user.agencyRole as AgencyPortalRole | null | undefined;
    if (!agencyRole) {
      agencyRole = await resolveAgencyRoleForUserId(session.user.id, session.user.email);
    }
    if (!agencyRole) return null;
    if (!studioMemberMayAccessProject(project, session.user.id, agencyRole)) {
      return null;
    }
    if (project.user) {
      const { passwordHash, clientInviteToken, clientInviteExpiresAt, ...rest } = project.user;
      void passwordHash;
      void clientInviteToken;
      void clientInviteExpiresAt;
      return { ...project, user: rest as typeof project.user };
    }
    return project;
  }

  if (!project.userId || project.userId !== session.user.id) return null;
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
