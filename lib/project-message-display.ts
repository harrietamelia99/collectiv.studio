import { portalClientAvatarPublicUrl } from "@/lib/portal-client-avatar";
import { resolvePersonaProfilePhoto } from "@/lib/team-headshots";

export type ProjectMessageAuthorSlice = {
  authorRole: string;
  authorUserId: string | null;
  author: {
    id: string;
    profilePhotoPath: string | null;
    studioTeamProfile: { photoUrl: string | null; personaSlug: string } | null;
  } | null;
};

export type FeedbackThreadMessage = {
  id: string;
  authorRole: string;
  authorName: string | null;
  body: string;
  createdAt: Date;
  authorPhotoUrl: string | null;
};

type RawMessageRow = ProjectMessageAuthorSlice & {
  id: string;
  authorName: string | null;
  body: string;
  createdAt: Date;
};

/** Resolved portrait URL for thread UI (studio headshots / client profile upload). */
export function authorPhotoUrlForProjectMessage(m: ProjectMessageAuthorSlice): string | null {
  if (!m.authorUserId || !m.author) return null;
  if (m.authorRole === "STUDIO") {
    return resolvePersonaProfilePhoto(
      m.author.studioTeamProfile?.photoUrl,
      m.author.studioTeamProfile?.personaSlug,
    );
  }
  if (m.authorRole === "CLIENT" && m.author.profilePhotoPath?.trim()) {
    const url = portalClientAvatarPublicUrl(m.author.id, m.author.profilePhotoPath.trim());
    return url || null;
  }
  return null;
}

export function mapProjectMessagesForFeedbackThread(rows: RawMessageRow[]): FeedbackThreadMessage[] {
  return rows.map((m) => ({
    id: m.id,
    authorRole: m.authorRole,
    authorName: m.authorName,
    body: m.body,
    createdAt: m.createdAt,
    authorPhotoUrl: authorPhotoUrlForProjectMessage(m),
  }));
}

/** Use with `prisma.projectMessage.findMany({ include: projectMessageAuthorInclude })`. */
export const projectMessageAuthorInclude = {
  author: {
    select: {
      id: true,
      profilePhotoPath: true,
      studioTeamProfile: { select: { photoUrl: true, personaSlug: true } },
    },
  },
} as const;
