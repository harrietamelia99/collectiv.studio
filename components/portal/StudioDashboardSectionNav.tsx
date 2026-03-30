import {
  DashIconCalendar,
  DashIconHome,
  DashIconInbox,
  DashIconPlus,
  DashIconProjects,
  DashIconTasks,
} from "@/components/portal/StudioDashboardIcons";

const primaryPill =
  "group inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-cream/40 px-3 py-1.5 font-body text-xs font-medium text-burgundy outline-offset-4 transition-colors hover:border-zinc-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy";

const secondaryQuiet =
  "group inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 font-body text-xs font-medium text-burgundy/55 outline-offset-4 transition-colors hover:border-zinc-200/90 hover:bg-zinc-50/90 hover:text-burgundy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy";

const mobileRow =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-burgundy outline-offset-4 transition-colors hover:bg-zinc-50/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy";

type Props = {
  inboxUnreadCount: number;
  showCalendarLinks?: boolean;
  /** When false, the New project shortcut is omitted (e.g. social-only lead). */
  showNewProjectLink?: boolean;
};

export function StudioDashboardSectionNav({
  inboxUnreadCount,
  showCalendarLinks = true,
  showNewProjectLink = true,
}: Props) {
  return (
    <div className="sticky top-[var(--portal-sticky-offset,4rem)] z-30 rounded-xl border border-zinc-200/90 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/90 sm:px-4 sm:py-3.5">
      <p className="sr-only" id="studio-dashboard-nav-label">
        On this page
      </p>

      {/* Small screens: one control, full list inside */}
      <details className="group md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-zinc-200/90 bg-white px-4 py-3 font-body text-sm font-semibold text-burgundy shadow-sm outline-offset-4 marker:content-none transition-colors hover:border-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy [&::-webkit-details-marker]:hidden">
          <span>Jump to a section</span>
          <span
            className="text-burgundy/40 transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </summary>
        <nav
          className="mt-2 max-h-[min(60vh,380px)] overflow-y-auto rounded-xl border border-zinc-200/90 bg-white p-2 shadow-sm"
          aria-labelledby="studio-dashboard-nav-label"
        >
          <ul className="space-y-0.5">
            <li>
              <a href="#studio-welcome" className={mobileRow}>
                <DashIconHome className="h-5 w-5 shrink-0 text-burgundy/70" />
                Overview
              </a>
            </li>
            <li>
              <a href="#studio-todos" className={mobileRow}>
                <DashIconTasks className="h-5 w-5 shrink-0 text-burgundy/70" />
                Tasks
              </a>
            </li>
            <li>
              <a href="#studio-comms" className={mobileRow}>
                <DashIconInbox className="h-5 w-5 shrink-0 text-burgundy/70" />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  Inbox &amp; team
                  {inboxUnreadCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-burgundy px-2 py-0.5 font-body text-[10px] font-bold text-cream">
                      {inboxUnreadCount > 99 ? "99+" : inboxUnreadCount}
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
            <li>
              <a href="#studio-projects" className={mobileRow}>
                <DashIconProjects className="h-5 w-5 shrink-0 text-burgundy/70" />
                Clients
              </a>
            </li>
            {showNewProjectLink ? (
              <li>
                <a href="#studio-new-project" className={mobileRow}>
                  <DashIconPlus className="h-5 w-5 shrink-0 text-burgundy/70" />
                  New project
                </a>
              </li>
            ) : null}
            {showCalendarLinks ? (
              <>
                <li className="my-2 border-t border-zinc-200 pt-2">
                  <p className="px-3 pb-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/40">
                    Also on this page
                  </p>
                </li>
                <li>
                  <a href="#studio-calendar" className={mobileRow}>
                    <DashIconCalendar className="h-5 w-5 shrink-0 text-burgundy/70" />
                    Calendar
                  </a>
                </li>
              </>
            ) : null}
          </ul>
        </nav>
      </details>

      {/* md+: fewer heavy controls; calendar stays easy but quieter */}
      <nav
        className="hidden flex-wrap items-center gap-x-1 gap-y-2 md:flex"
        aria-labelledby="studio-dashboard-nav-label"
      >
        <a href="#studio-welcome" className={primaryPill}>
          <DashIconHome className="h-3.5 w-3.5 shrink-0 text-burgundy/75" />
          Overview
        </a>
        <a href="#studio-todos" className={primaryPill}>
          <DashIconTasks className="h-3.5 w-3.5 shrink-0 text-burgundy/75" />
          Tasks
        </a>
        <a href="#studio-comms" className={primaryPill}>
          <DashIconInbox className="h-3.5 w-3.5 shrink-0 text-burgundy/75" />
          Inbox
          {inboxUnreadCount > 0 ? (
            <span className="ml-0.5 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-burgundy px-1 font-body text-[10px] font-bold text-cream">
              {inboxUnreadCount > 99 ? "99+" : inboxUnreadCount}
            </span>
          ) : null}
        </a>
        <a href="#studio-projects" className={primaryPill}>
          <DashIconProjects className="h-3.5 w-3.5 shrink-0 text-burgundy/75" />
          Clients
        </a>
        {showNewProjectLink ? (
          <a href="#studio-new-project" className={primaryPill}>
            <DashIconPlus className="h-3.5 w-3.5 shrink-0 text-burgundy/75" />
            New project
          </a>
        ) : null}
        {showCalendarLinks ? (
          <>
            <span
              className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block"
              aria-hidden
            />
            <a href="#studio-calendar" className={secondaryQuiet}>
              <DashIconCalendar className="h-4 w-4 shrink-0 text-burgundy/45 group-hover:text-burgundy/80" />
              Calendar
            </a>
          </>
        ) : null}
      </nav>
    </div>
  );
}
