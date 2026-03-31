import { studioAdminDisplayLabel, type StudioAdminSelectUser } from "@/lib/studio-admin-options";
import { resolvePersonaProfilePhoto } from "@/lib/team-headshots";

export type ConversationStripClient = {
  logoPath: string | null;
  personName: string | null;
  businessName: string | null;
};

export type ConversationStripStudio = {
  photoUrl: string | null;
  displayName: string;
  jobTitle: string | null;
};

type AssigneeForStrip = {
  id: string;
  email: string;
  name: string | null;
  studioTeamProfile: {
    welcomeName: string | null;
    personaSlug: string;
    studioRole: string;
    jobTitle: string;
    photoUrl: string | null;
  } | null;
};

/** Data for the client “Feedback & messages” participant row (requires logged-in client + assignee). */
export function buildClientConversationStripData(project: {
  websiteLogoPath: string | null;
  user: { name: string | null; businessName: string | null } | null;
  assignedStudioUser: AssigneeForStrip | null;
}): { client: ConversationStripClient; studio: ConversationStripStudio } | null {
  if (!project.user || !project.assignedStudioUser) return null;
  const su = project.assignedStudioUser;
  const forLabel: StudioAdminSelectUser = {
    id: su.id,
    email: su.email,
    name: su.name,
    studioTeamProfile: su.studioTeamProfile
      ? {
          welcomeName: su.studioTeamProfile.welcomeName,
          personaSlug: su.studioTeamProfile.personaSlug,
          studioRole: su.studioTeamProfile.studioRole,
        }
      : null,
  };
  return {
    client: {
      logoPath: project.websiteLogoPath,
      personName: project.user.name,
      businessName: project.user.businessName,
    },
    studio: {
      photoUrl: resolvePersonaProfilePhoto(
        su.studioTeamProfile?.photoUrl,
        su.studioTeamProfile?.personaSlug,
      ),
      displayName: studioAdminDisplayLabel(forLabel),
      jobTitle: su.studioTeamProfile?.jobTitle?.trim() || null,
    },
  };
}
