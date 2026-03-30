import { teamHeadshotPathForPersona } from "@/lib/team-headshots";

export const PERSONA_SLUGS = ["isabella", "harriet", "may"] as const;

export type PersonaSlug = (typeof PERSONA_SLUGS)[number];

/**
 * Default job title on `StudioTeamMember` (editable in portal profile). Keep aligned with how you split work.
 */
export const PERSONA_DEFAULT_JOB_TITLE: Record<PersonaSlug, string> = {
  /** Issy — oversight on Harriet-led project accounts; no social calendar */
  isabella: "Operations — oversight on project accounts (Harriet-led); client comms & flow",
  harriet: "Designer & business owner",
  /** Social-only subscriptions: calendar, client thread & comms on assigned accounts */
  may: "Social media management — assigned social clients, calendar & messages",
};

/** Short name for UI / @mentions (Issy, not Isabella). */
export const PERSONA_WELCOME_NAME: Record<PersonaSlug, string> = {
  isabella: "Issy",
  harriet: "Harriet",
  may: "May",
};

/** Short public label under the dashboard greeting (no internal split-of-work copy). */
export const PERSONA_DASHBOARD_PUBLIC_ROLE: Record<PersonaSlug, string> = {
  isabella: "Operations",
  harriet: "Creative Director",
  may: "Social Media Manager",
};

/**
 * Full role description (help copy, notifications).
 */
export const PERSONA_ROLE_SUMMARY: Record<PersonaSlug, string> = {
  harriet: "Designer & business owner — creative direction, brand, website kit reviews.",
  isabella:
    "Operations — visibility on Harriet-led project accounts (website / multi / one-off), client comms & flow; no social subscriptions or social content calendar.",
  may: "Social media management only — assigned social subscriptions, calendar, client thread, and @mentions in team chat.",
};

/** Short line for assignee &lt;option&gt; labels (keep readable in selects). */
export const PERSONA_ASSIGNEE_OPTION_HINT: Record<PersonaSlug, string> = {
  harriet: "Designer & business owner",
  isabella: "Ops · flow, calendar, assigning, client comms",
  may: "Social & calendar sign-off (with Issy)",
};

export function isPersonaSlug(v: string): v is PersonaSlug {
  return (PERSONA_SLUGS as readonly string[]).includes(v);
}

export function welcomeNameForPersonaSlug(slug: string): string {
  if (isPersonaSlug(slug)) return PERSONA_WELCOME_NAME[slug];
  return slug;
}

/** Public paths under `/public` when `StudioTeamMember.photoUrl` is empty — same as About `TeamCard`. */
export function defaultPersonaHeadshotPath(slug: string): string | null {
  return teamHeadshotPathForPersona(slug);
}
