import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { notifyStudioTeamMention } from "@/lib/studio-inbox-notify";
import { type PortalFormFlash, portalFlashErr, portalFlashOk } from "@/lib/portal-form-flash";
import {
  parseMentionHandles,
  resolveMentionHandlesToUserIds,
  studioTeamChatVisibleToMayUser,
  type MentionMember,
} from "@/lib/studio-team-mentions";
import { isPersonaSlug } from "@/lib/studio-team-config";
import { PERSONA_WELCOME_NAME } from "@/lib/studio-team-config";
import type { AgencyPortalRole } from "@/lib/studio-team-roles";
import { STUDIO_TEAM_ROLE } from "@/lib/studio-team-roles";
import { resolvePersonaProfilePhoto } from "@/lib/team-headshots";

export type StudioTeamChatMessageDto = {
  id: string;
  body: string;
  createdAt: string;
  authorUserId: string;
  authorName: string;
  authorPhotoUrl: string | null;
  authorInitials: string;
};

function initialsForChatAuthor(displayName: string): string {
  const t = displayName.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]![0];
    const b = parts[1]![0];
    if (a && b) return (a + b).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

export async function loadStudioTeamChatMessagesForApi(
  viewerUserId: string,
  agencyRole: AgencyPortalRole,
): Promise<StudioTeamChatMessageDto[]> {
  const rows = await prisma.studioTeamChatMessage.findMany({
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
  });
  const chronological = [...rows].reverse();
  const visible =
    agencyRole === "SOCIAL_MANAGER"
      ? chronological.filter((m) => studioTeamChatVisibleToMayUser(m, viewerUserId))
      : chronological;

  return visible.map((msg) => {
    const p = msg.author.studioTeamProfile;
    const displayName =
      p?.welcomeName?.trim() ||
      msg.author.name?.trim().split(/\s+/)[0] ||
      msg.author.email.split("@")[0] ||
      "Teammate";
    const slug = p?.personaSlug ?? null;
    const photoUrl = resolvePersonaProfilePhoto(p?.photoUrl ?? null, slug);
    return {
      id: msg.id,
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
      authorUserId: msg.authorUserId,
      authorName: displayName,
      authorPhotoUrl: photoUrl,
      authorInitials: initialsForChatAuthor(displayName),
    };
  });
}

export type StudioTeamChatMentionCandidateDto = {
  /** Inserted after @ (resolver lowercases). */
  handle: string;
  /** Row label in the picker. */
  label: string;
};

/**
 * Teammates the viewer can @mention (excludes self). Handles align with `resolveMentionHandlesToUserIds`.
 */
export async function loadStudioTeamChatMentionCandidates(
  viewerUserId: string,
): Promise<StudioTeamChatMentionCandidateDto[]> {
  const rows = await prisma.studioTeamMember.findMany({
    where: { userId: { not: viewerUserId } },
    include: { user: { select: { name: true, email: true } } },
  });

  const seen = new Set<string>();
  const out: StudioTeamChatMentionCandidateDto[] = [];

  function add(handle: string, label: string) {
    const k = handle.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ handle, label });
  }

  const socialManagers = rows.filter((r) => r.studioRole === STUDIO_TEAM_ROLE.SOCIAL_MANAGER);
  const others = rows.filter((r) => r.studioRole !== STUDIO_TEAM_ROLE.SOCIAL_MANAGER);

  for (const r of others) {
    const slug = r.personaSlug?.trim() ?? "";
    if (isPersonaSlug(slug)) {
      if (slug === "isabella") {
        add(PERSONA_WELCOME_NAME.isabella, PERSONA_WELCOME_NAME.isabella);
        add("Isabella", "Isabella");
      } else if (slug === "harriet") {
        add(PERSONA_WELCOME_NAME.harriet, PERSONA_WELCOME_NAME.harriet);
      }
    } else {
      const w = r.welcomeName?.trim().split(/\s+/)[0];
      const n = r.user.name?.trim().split(/\s+/)[0];
      const pick =
        (w && /^[\w.-]+$/i.test(w) ? w : null) ??
        (n && /^[\w.-]+$/i.test(n) ? n : null);
      const local = r.user.email.split("@")[0] ?? "";
      const fallback = pick ?? (local && /^[\w.-]+$/i.test(local) ? local : null);
      if (fallback) {
        const label = r.welcomeName?.trim() || r.user.name?.trim() || r.user.email;
        add(fallback, label);
      }
    }
  }

  if (socialManagers.length > 0) {
    add(
      PERSONA_WELCOME_NAME.may,
      socialManagers.length > 1 ? "May · social team" : PERSONA_WELCOME_NAME.may,
    );
  }

  function sortKey(handle: string): number {
    const l = handle.toLowerCase();
    if (l === "issy" || l === "isabella") return 0;
    if (l === "harriet") return 1;
    if (l === "may") return 2;
    return 3;
  }

  out.sort((a, b) => {
    const ka = sortKey(a.handle);
    const kb = sortKey(b.handle);
    if (ka !== kb) return ka - kb;
    return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
  });

  return out;
}

export async function postStudioTeamChatMessageCore(
  sessionUserId: string,
  body: string,
): Promise<PortalFormFlash> {
  const author = await prisma.studioTeamMember.findUnique({
    where: { userId: sessionUserId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!author) {
    return portalFlashErr("Couldn’t send message. Try again.");
  }

  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 4000) {
    return portalFlashErr("Message is empty or too long.");
  }

  const membersRaw = await prisma.studioTeamMember.findMany({
    include: { user: { select: { name: true, email: true } } },
  });
  const members: MentionMember[] = membersRaw.map((m) => ({
    userId: m.userId,
    personaSlug: m.personaSlug,
    studioRole: m.studioRole,
    welcomeName: m.welcomeName,
    user: m.user,
  }));

  const handles = parseMentionHandles(trimmed);
  const mentionedUserIds = resolveMentionHandlesToUserIds(handles, members, sessionUserId);

  await prisma.studioTeamChatMessage.create({
    data: {
      authorUserId: sessionUserId,
      body: trimmed,
      mentionedUserIds: JSON.stringify(mentionedUserIds),
    },
  });

  const authorDisplay =
    author.welcomeName?.trim() ||
    author.user.name?.trim().split(/\s+/)[0] ||
    author.user.email.split("@")[0] ||
    "Teammate";

  if (mentionedUserIds.length > 0) {
    await notifyStudioTeamMention(mentionedUserIds, authorDisplay, trimmed, sessionUserId);
  }

  revalidatePath("/portal");
  return portalFlashOk("Message sent ✓");
}
