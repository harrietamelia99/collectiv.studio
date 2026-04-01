import { isPersonaSlug, type PersonaSlug } from "@/lib/studio-team-config";
import { STUDIO_TEAM_ROLE } from "@/lib/studio-team-roles";

/**
 * Inbox for team-chat @mention emails (transactional). Persona-aligned with Issy / Harriet / May.
 */
const TEAM_CHAT_MENTION_EMAIL: Record<PersonaSlug, string> = {
  isabella: "isabella@collectivstudio.uk",
  harriet: "harriet@collectivstudio.uk",
  may: "zbyszka@collectivstudio.uk",
};

/**
 * Where to send “tagged in team chat” email for a studio member.
 * Falls back to their portal account email if persona/role does not match.
 */
export function resolveTeamChatMentionNotifyEmail(input: {
  email: string | null | undefined;
  personaSlug: string | null | undefined;
  studioRole: string | null | undefined;
}): string | null {
  const slug = input.personaSlug?.trim() ?? "";
  if (isPersonaSlug(slug)) {
    return TEAM_CHAT_MENTION_EMAIL[slug].trim().toLowerCase();
  }
  if (input.studioRole === STUDIO_TEAM_ROLE.SOCIAL_MANAGER) {
    return TEAM_CHAT_MENTION_EMAIL.may.trim().toLowerCase();
  }
  const fallback = input.email?.trim().toLowerCase();
  return fallback || null;
}
