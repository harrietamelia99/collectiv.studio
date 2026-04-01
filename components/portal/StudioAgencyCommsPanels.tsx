import Link from "next/link";
import {
  deleteStudioNotification,
  markAllStudioNotificationsRead,
  markStudioNotificationRead,
} from "@/app/portal/agency-actions";
import {
  StudioAgencyClientInboxSections,
  type CalendarInboxRowUi,
  type ThreadInboxRowUi,
} from "@/components/portal/StudioAgencyClientInboxSections";
import { DashIconBell, DashIconInbox, StudioSectionIcon } from "@/components/portal/StudioDashboardIcons";

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

type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

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
    case "LAUNCH_LIST_SIGNUP":
      return "Launch list";
    default:
      return "Update";
  }
}

export function StudioAgencyCommsPanels({
  notifications,
  threadInboxRows,
  calendarInboxRows,
}: {
  notifications: NotificationRow[];
  threadInboxRows: ThreadInboxRowUi[];
  calendarInboxRows: CalendarInboxRowUi[];
}) {
  const unreadCount = notifications.filter((n) => !n.readAt).length;

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
              Inbox &amp; updates
            </h2>
            <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-burgundy/62">
              Notifications, client threads that need your reply, and calendar feedback when it applies to your projects.
              Studio-only team chat lives in the{" "}
              <span className="font-medium text-burgundy">message bubble (bottom-left)</span> on any portal page —{" "}
              <strong className="font-medium text-burgundy">@mentions</strong> email tagged teammates.
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

      <div id="studio-client-inbox" className="scroll-mt-28">
        <StudioAgencyClientInboxSections threadRows={threadInboxRows} calendarRows={calendarInboxRows} />
      </div>
    </section>
  );
}
