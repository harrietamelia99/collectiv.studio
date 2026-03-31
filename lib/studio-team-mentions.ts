import type { PersonaSlug } from "@/lib/studio-team-config";
import { isPersonaSlug } from "@/lib/studio-team-config";
import { studioMemberMayAccessProject } from "@/lib/portal-access";
import type { AgencyPortalRole } from "@/lib/studio-team-roles";
import { STUDIO_TEAM_ROLE } from "@/lib/studio-team-roles";

/** Normalise @handle from message body (lowercase). */
export function parseMentionHandles(body: string): string[] {
  const re = /@([\w.-]+)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push(m[1].toLowerCase());
  }
  return Array.from(new Set(out));
}

const PERSONA_ALIASES: Record<string, PersonaSlug> = {
  isabella: "isabella",
  issy: "isabella",
  isabel: "isabella",
  harriet: "harriet",
  may: "may",
};

export type MentionMember = {
  userId: string;
  personaSlug: string;
  studioRole: string;
  welcomeName: string | null;
  user: { name: string | null; email: string };
};

function addAllSocialManagers(
  members: MentionMember[],
  ids: Set<string>,
  excludeUserId?: string,
): void {
  for (const m of members) {
    if (m.studioRole !== STUDIO_TEAM_ROLE.SOCIAL_MANAGER) continue;
    if (m.userId !== excludeUserId) ids.add(m.userId);
  }
}

/** Map @handles to studio user ids (excludes author if passed). */
export function resolveMentionHandlesToUserIds(
  handles: string[],
  members: MentionMember[],
  excludeUserId?: string,
): string[] {
  const ids = new Set<string>();

  for (const raw of handles) {
    if (raw === "may") {
      addAllSocialManagers(members, ids, excludeUserId);
      continue;
    }

    const slugFromAlias = PERSONA_ALIASES[raw];
    if (slugFromAlias) {
      if (slugFromAlias === "may") {
        addAllSocialManagers(members, ids, excludeUserId);
        continue;
      }
      const m = members.find((x) => x.personaSlug === slugFromAlias);
      if (m && m.userId !== excludeUserId) ids.add(m.userId);
      continue;
    }

    if (isPersonaSlug(raw)) {
      if (raw === "may") {
        addAllSocialManagers(members, ids, excludeUserId);
        continue;
      }
      const m = members.find((x) => x.personaSlug === raw);
      if (m && m.userId !== excludeUserId) ids.add(m.userId);
      continue;
    }

    for (const m of members) {
      if (m.userId === excludeUserId) continue;
      const w = m.welcomeName?.trim().toLowerCase().split(/\s+/)[0];
      if (w && w === raw) {
        ids.add(m.userId);
        break;
      }
      const first = m.user.name?.trim().toLowerCase().split(/\s+/)[0];
      if (first && first === raw) {
        ids.add(m.userId);
        break;
      }
      const local = m.user.email.split("@")[0]?.toLowerCase();
      if (local && local === raw) {
        ids.add(m.userId);
        break;
      }
    }
  }

  return Array.from(ids);
}

function greetingAddresseeUserIds(body: string, members: MentionMember[]): string[] {
  const line = (body.split(/\n/)[0] ?? body).trim();
  const m = line.match(/\b(?:hi|hello|hey)\s*,?\s*(harriet|issy|isabella|may)\b/i);
  if (!m) return [];
  const name = m[1].toLowerCase();
  if (name === "may") {
    const ids = new Set<string>();
    addAllSocialManagers(members, ids);
    return Array.from(ids);
  }
  const slug: PersonaSlug | null =
    name === "issy" || name === "isabella" ? "isabella" : name === "harriet" ? "harriet" : null;
  if (!slug) return [];
  const row = members.find((x) => x.personaSlug === slug);
  return row?.userId ? [row.userId] : [];
}

/**
 * Studio dashboard “Waiting on your reply”.
 * If the client @-mentioned someone or opened with “Hi Harriet / Issy / May …”, only those teammates see the row
 * (even when the project is assigned to someone else — e.g. social lead vs design question).
 * Otherwise use assignee / pickup visibility (`studioMemberMayAccessProject`).
 */
export function studioInboxAwaitingReplyVisibleToViewer(
  lastClientMessageBody: string,
  viewerUserId: string,
  project: { portalKind: string; assignedStudioUserId: string | null },
  viewerAgencyRole: AgencyPortalRole,
  members: MentionMember[],
): boolean {
  const handleIds = resolveMentionHandlesToUserIds(parseMentionHandles(lastClientMessageBody), members);
  const greetIds = greetingAddresseeUserIds(lastClientMessageBody, members);
  const targetIds = Array.from(new Set([...handleIds, ...greetIds]));
  if (targetIds.length > 0) {
    return targetIds.includes(viewerUserId);
  }
  return studioMemberMayAccessProject(project, viewerUserId, viewerAgencyRole);
}

/** Social manager’s team chat: own messages + threads where they were @-mentioned (persisted ids). */
export function studioTeamChatVisibleToMayUser(
  msg: { authorUserId: string; mentionedUserIds: string },
  mayUserId: string,
): boolean {
  if (msg.authorUserId === mayUserId) return true;
  try {
    const parsed = JSON.parse(msg.mentionedUserIds || "[]") as unknown;
    if (!Array.isArray(parsed)) return false;
    return parsed.some((id) => id === mayUserId);
  } catch {
    return false;
  }
}
