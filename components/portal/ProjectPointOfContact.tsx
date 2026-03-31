import { studioAdminDisplayLabel, type StudioAdminSelectUser } from "@/lib/studio-admin-options";
import { HubIconMessages } from "@/components/portal/ProjectHubIcons";
import { resolvePersonaProfilePhoto } from "@/lib/team-headshots";

export type ProjectAssigneeForContact = {
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

function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0] + parts[1]![0]).toUpperCase();
  const w = parts[0] ?? "?";
  return w.slice(0, 2).toUpperCase();
}

type Props = {
  assignee: ProjectAssigneeForContact;
  /** Sits inside the project overview card without a second frame. */
  variant?: "card" | "embedded";
  className?: string;
  /** In-page or cross-page link to the feedback thread (e.g. #project-messages). Omit to hide. */
  messagesHref?: string;
};

export function ProjectPointOfContact({
  assignee,
  variant = "card",
  className = "",
  messagesHref,
}: Props) {
  const forLabel: StudioAdminSelectUser = {
    id: assignee.id,
    email: assignee.email,
    name: assignee.name,
    studioTeamProfile: assignee.studioTeamProfile
      ? {
          welcomeName: assignee.studioTeamProfile.welcomeName,
          personaSlug: assignee.studioTeamProfile.personaSlug,
          studioRole: assignee.studioTeamProfile.studioRole,
        }
      : null,
  };
  const displayName = studioAdminDisplayLabel(forLabel);
  const title =
    assignee.studioTeamProfile?.jobTitle?.trim() || "Your contact at Collectiv. Studio";
  const photo = resolvePersonaProfilePhoto(
    assignee.studioTeamProfile?.photoUrl,
    assignee.studioTeamProfile?.personaSlug,
  );

  const heading = (
    <h2
      id="project-point-of-contact-heading"
      className="font-body text-[10px] font-bold uppercase tracking-[0.12em] text-burgundy/55"
    >
      Your point of contact
    </h2>
  );

  const messageLink = messagesHref ? (
    <a
      href={messagesHref}
      className="group/msg flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-white text-burgundy shadow-sm transition-[border-color,background-color,box-shadow] hover:border-burgundy/25 hover:bg-burgundy/[0.04] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy/40"
      aria-label="Jump to feedback and messages"
    >
      <HubIconMessages className="h-5 w-5 transition-transform group-hover/msg:scale-105" aria-hidden />
    </a>
  ) : null;

  const body = (
    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        {photo ? (
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-zinc-200/90 bg-zinc-50 shadow-sm sm:h-14 sm:w-14">
            {/* eslint-disable-next-line @next/next/no-img-element -- team URLs may be external or /public paths */}
            <img
              src={photo}
              alt=""
              className="h-full w-full object-cover object-top"
              aria-hidden
            />
          </span>
        ) : (
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-burgundy/[0.08] font-body text-sm font-semibold uppercase tracking-wide text-burgundy shadow-sm sm:h-14 sm:w-14"
            aria-hidden
          >
            {initialsFromDisplayName(displayName)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight tracking-[-0.02em] text-burgundy">{displayName}</p>
          <p className="mt-1 font-body text-[13px] leading-snug text-burgundy/65">{title}</p>
        </div>
      </div>
      {messageLink}
    </div>
  );

  if (variant === "embedded") {
    return (
      <section className={className.trim()} aria-labelledby="project-point-of-contact-heading">
        {heading}
        {body}
      </section>
    );
  }

  return (
    <section
      className={`rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5 ${className}`.trim()}
      aria-labelledby="project-point-of-contact-heading"
    >
      {heading}
      {body}
    </section>
  );
}
