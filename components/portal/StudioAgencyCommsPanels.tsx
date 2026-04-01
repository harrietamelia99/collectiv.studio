import Link from "next/link";
import {
  deleteStudioNotification,
  markAllStudioNotificationsRead,
  markStudioNotificationRead,
} from "@/app/portal/agency-actions";
import { StudioTeamChatComposer } from "@/components/portal/StudioTeamChatComposer";
import {
  StudioAgencyClientInboxSections,
  type CalendarInboxRowUi,
  type ThreadInboxRowUi,
} from "@/components/portal/StudioAgencyClientInboxSections";
import {
  DashIconBell,
  DashIconInbox,
  DashIconUsers,
  StudioSectionIcon,
} from "@/components/portal/StudioDashboardIcons";
import type { PersonaSlug } from "@/lib/studio-team-config";
import { PERSONA_WELCOME_NAME } from "@/lib/studio-team-config";
import { resolvePersonaProfilePhoto } from "@/lib/team-headshots";

function utcYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function NotificationRemoveIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatChatBody(body: string): React.ReactNode {
  const parts = body.split(/(@[\w.-]+)/gi);
  return parts.map((part, i) =>
    /^@[\w.-]+$/i.test(part) ? (
      <span key={i} className="rounded bg-zinc-200/90 px-1 font-mono text-[12px] font-semibold text-zinc-800">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

type ChatRow = {
  id: string;
  body: string;
  createdAt: Date;
  author: {
    name: string | null;
    email: string;
    studioTeamProfile: { welcomeName: string | null; personaSlug: string; photoUrl: string | null } | null;
  };
};

type TeamMemberHint = {
  userId: string;
  personaSlug: string;
  welcomeName: string | null;
  user: { name: string | null; email: string };
};

function chatAuthorLabel(msg: ChatRow): string {
  const p = msg.author.studioTeamProfile;
  return (
    p?.welcomeName?.trim() ||
    msg.author.name?.trim().split(/\s+/)[0] ||
    msg.author.email.split("@")[0] ||
    "Teammate"
  );
}

function chatAuthorInitials(msg: ChatRow): string {
  const label = chatAuthorLabel(msg);
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0] + parts[1]![0]).toUpperCase();
  return (parts[0] ?? "?").slice(0, 2).toUpperCase();
}

function chatAuthorPhotoSrc(msg: ChatRow): string | null {
  return resolvePersonaProfilePhoto(
    msg.author.studioTeamProfile?.photoUrl,
    msg.author.studioTeamProfile?.personaSlug,
  );
}

function kindLabel(kind: string): string {
  switch (kind) {
    case "CLIENT_MESSAGE":
      return "Message";
    case "CALENDAR_FEEDBACK":
      return "Calendar";
    case "SOCIAL_MONTH_FILL_REMINDER":
      return "Calendar";
    case "TEAM_MENTION":
      return "Mention";
    case "CONTACT_FORM_ENQUIRY":
      return "Enquiry";
    default:
      return "Update";
  }
}

export function StudioAgencyCommsPanels({
  notifications,
  threadInboxRows,
  calendarInboxRows,
  teamChatMessages,
  teamMembersForHints,
}: {
  notifications: NotificationRow[];
  threadInboxRows: ThreadInboxRowUi[];
  calendarInboxRows: CalendarInboxRowUi[];
  teamChatMessages: ChatRow[];
  teamMembersForHints: TeamMemberHint[];
}) {
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const mentionHint = teamMembersForHints
    .map((m) => {
      const slug = m.personaSlug as PersonaSlug;
      const nick = slug in PERSONA_WELCOME_NAME ? PERSONA_WELCOME_NAME[slug] : m.personaSlug;
      return `@${nick}`;
    })
    .join(" · ");

  return (
    <section
      id="studio-comms"
      className="cc-portal-client-shell scroll-mt-28 space-y-10"
      aria-labelledby="comms-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <StudioSectionIcon Icon={DashIconInbox} className="max-sm:mt-0.5" />
          <div className="min-w-0">
            <h2 id="comms-heading" className="font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl">
              Inbox &amp; team
            </h2>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-burgundy/62">
              Notifications, threads that need your reply, calendar feedback when it applies to your projects, and
              team-only chat. Use <strong className="font-medium text-burgundy">@mentions</strong> — tagged people get an
              email.
            </p>
          </div>
        </div>
      </div>

      <div id="studio-notifications" className="scroll-mt-28">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <h3 className="m-0 flex flex-wrap items-center gap-2 font-display text-lg tracking-[-0.02em] text-burgundy">
            <StudioSectionIcon Icon={DashIconBell} className="!h-9 !w-9" />
            <span className="inline-flex items-center gap-2">
              Notifications
              {unreadCount > 0 ? (
                <span className="inline-flex min-w-[1.5rem] justify-center rounded-full bg-burgundy px-2 py-0.5 font-body text-xs font-semibold text-cream">
                  {unreadCount}
                </span>
              ) : null}
            </span>
          </h3>
          {unreadCount > 0 ? (
            <form action={markAllStudioNotificationsRead}>
              <button
                type="submit"
                className="rounded-full border border-burgundy/30 bg-white px-3 py-1.5 font-body text-xs font-semibold text-burgundy transition-colors hover:border-burgundy hover:bg-burgundy hover:text-cream"
              >
                Mark all read
              </button>
            </form>
          ) : null}
        </div>
        {notifications.length === 0 ? (
          <p className="mt-4 font-body text-sm text-burgundy/55">You&apos;re all caught up — nothing new yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                  n.readAt ? "border-zinc-200/90 bg-white" : "border-zinc-300/90 bg-zinc-50/90"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-burgundy/10 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-burgundy">
                      {kindLabel(n.kind)}
                    </span>
                    {!n.readAt ? (
                      <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-burgundy/50">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-body text-sm font-semibold text-burgundy">{n.title}</p>
                  {n.body ? (
                    <p className="mt-0.5 line-clamp-2 font-body text-[13px] leading-relaxed text-burgundy/65">
                      {n.body}
                    </p>
                  ) : null}
                  <p className="mt-1 font-body text-[11px] text-burgundy/45">{utcYmd(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {n.href ? (
                    <Link
                      href={n.href}
                      className="rounded-full bg-burgundy px-3 py-1.5 font-body text-xs font-semibold text-cream shadow-sm hover:opacity-90"
                    >
                      Open
                    </Link>
                  ) : null}
                  {!n.readAt ? (
                    <form action={markStudioNotificationRead.bind(null, n.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-burgundy/25 px-3 py-1.5 font-body text-xs font-medium text-burgundy hover:border-burgundy"
                      >
                        Dismiss
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteStudioNotification.bind(null, n.id)}>
                    <button
                      type="submit"
                      aria-label="Delete notification"
                      title="Delete notification"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-burgundy transition-colors hover:border-burgundy/35 hover:bg-burgundy/[0.06]"
                    >
                      <NotificationRemoveIcon />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div id="studio-client-inbox" className="scroll-mt-28">
          <StudioAgencyClientInboxSections threadRows={threadInboxRows} calendarRows={calendarInboxRows} />
        </div>

        <div
          id="studio-team-chat"
          className="scroll-mt-28 flex min-h-0 flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <StudioSectionIcon Icon={DashIconUsers} className="!h-9 !w-9 max-sm:mt-0.5" />
            <div className="min-w-0">
              <h3 className="m-0 font-display text-lg tracking-[-0.02em] text-zinc-900">Team chat</h3>
              <p className="mt-1 font-body text-xs leading-relaxed text-burgundy/55">
                Studio-only.
                {mentionHint
                  ? ` Examples: ${mentionHint} — tagged people get an email.`
                  : " Use @names to ping someone — they get a notification."}
              </p>
            </div>
          </div>
          <div className="mt-5 max-h-[min(420px,50vh)] flex-1 space-y-3 overflow-y-auto rounded-xl border border-zinc-200/90 bg-zinc-50/40 p-3 sm:p-4">
            {teamChatMessages.length === 0 ? (
              <p className="px-1 font-mono text-[13px] text-zinc-500">Say hi — first message starts the thread.</p>
            ) : (
              teamChatMessages.map((msg) => {
                const photo = chatAuthorPhotoSrc(msg);
                return (
                  <div
                    key={msg.id}
                    className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    {photo ? (
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-200/90 bg-zinc-50 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element -- team profile or default headshot path */}
                        <img src={photo} alt="" className="h-full w-full object-cover" />
                      </span>
                    ) : (
                      <span
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-zinc-100 font-mono text-sm font-semibold text-zinc-600 shadow-sm"
                        aria-hidden
                      >
                        {chatAuthorInitials(msg)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                          From
                        </p>
                        <span className="font-mono text-[10px] tabular-nums text-zinc-400">
                          {msg.createdAt.toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 font-display text-lg font-normal tracking-[-0.02em] text-zinc-900">
                        {chatAuthorLabel(msg)}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-zinc-700">
                        {formatChatBody(msg.body)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <StudioTeamChatComposer />
        </div>
      </div>
    </section>
  );
}
