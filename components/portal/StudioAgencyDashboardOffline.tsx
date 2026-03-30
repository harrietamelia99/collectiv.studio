import Link from "next/link";
import { StudioDashboardSectionNav } from "@/components/portal/StudioDashboardSectionNav";
import { StudioDueCalendar } from "@/components/portal/StudioDueCalendar";
import {
  DashIconCalendar,
  DashIconInbox,
  DashIconProjects,
  DashIconTasks,
  StudioSectionIcon,
} from "@/components/portal/StudioDashboardIcons";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { ClipboardList, FolderKanban } from "lucide-react";

type Props = { createdBanner?: "single" | "pair" | null };

export function StudioAgencyDashboardOffline({ createdBanner = null }: Props) {
  return (
    <div className="space-y-12">
      {createdBanner === "pair" ? (
        <div
          className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-5 py-4 font-body text-sm leading-relaxed text-burgundy shadow-sm"
          role="status"
        >
          Done — you created <strong className="font-medium text-burgundy">two</strong> projects. They will appear here once
          the database is connected.
        </div>
      ) : createdBanner === "single" ? (
        <div
          className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-5 py-4 font-body text-sm leading-relaxed text-burgundy shadow-sm"
          role="status"
        >
          Your new project will show in the client list after the database is available.
        </div>
      ) : null}

      <div className="space-y-4 sm:space-y-5">
        <section
          id="studio-welcome"
          className="cc-portal-client-shell scroll-mt-28 w-full"
          aria-labelledby="welcome-offline-heading"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-display text-2xl text-burgundy ring-2 ring-zinc-300/80 ring-offset-2 ring-offset-cream sm:h-24 sm:w-24"
              aria-hidden
            >
              ·
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="welcome-offline-heading" className="font-display text-2xl tracking-[-0.03em] text-burgundy sm:text-3xl">
                Studio dashboard (preview)
              </h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-burgundy/70">
                Quick navigation below still scrolls to each section. Tasks, inbox, clients, and calendar will populate from
                the database once it&apos;s connected.
              </p>
            </div>
          </div>
        </section>

        <StudioDashboardSectionNav inboxUnreadCount={0} showNewProjectLink />
      </div>

      <section id="studio-todos" className="cc-portal-client-shell scroll-mt-28" aria-labelledby="todos-offline-heading">
        <div className="flex items-start gap-3 sm:gap-4">
          <StudioSectionIcon Icon={DashIconTasks} />
          <div className="min-w-0">
            <h2 id="todos-offline-heading" className="font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl">
              Your tasks
            </h2>
          </div>
        </div>
        <div className="mt-6">
          <PortalEmptyState
            icon={ClipboardList}
            title="No tasks loaded"
            description="Agency todos load from the database. After you connect Supabase, open tasks, due dates, and Mark done will work end-to-end."
          />
        </div>
      </section>

      <section id="studio-comms" className="cc-portal-client-shell scroll-mt-28" aria-labelledby="comms-offline-heading">
        <div className="flex items-start gap-3 sm:gap-4">
          <StudioSectionIcon Icon={DashIconInbox} />
          <div className="min-w-0">
            <h2 id="comms-offline-heading" className="font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl">
              Inbox &amp; team
            </h2>
            <p className="mt-2 font-body text-sm text-burgundy/65">
              Notifications, client threads, and team chat need the database. Buttons like Dismiss and Mark read will respond
              once writes succeed.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-dashed border-burgundy/25 bg-burgundy/[0.02] px-4 py-8 text-center font-body text-sm text-burgundy/60">
          Connect the database to load inbox items here.
        </div>
      </section>

      <section id="studio-calendar" className="cc-portal-client-shell scroll-mt-28" aria-labelledby="cal-offline-heading">
        <div className="flex items-start gap-3 sm:gap-4">
          <StudioSectionIcon Icon={DashIconCalendar} />
          <div className="min-w-0">
            <h2 id="cal-offline-heading" className="font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl">
              Calendar
            </h2>
            <p className="mt-2 font-body text-sm text-burgundy/65">Month controls work; events appear when tasks and posts are stored.</p>
          </div>
        </div>
        <div className="mt-8">
          <StudioDueCalendar events={[]} timeOff={[]} />
        </div>
      </section>

      <section id="studio-projects" className="scroll-mt-28" aria-labelledby="projects-offline-heading">
        <div className="flex items-start gap-3 sm:gap-4">
          <StudioSectionIcon Icon={DashIconProjects} />
          <div className="min-w-0">
            <h2 id="projects-offline-heading" className="font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl">
              Clients you&apos;re working with
            </h2>
          </div>
        </div>
        <div className="mt-6">
          <PortalEmptyState
            icon={FolderKanban}
            title="No project cards yet"
            description="Client project snapshots load from the database. Go to project links and progress bars will work after connection."
          />
        </div>
      </section>

      <section id="studio-new-project" className="cc-portal-client-shell scroll-mt-28" aria-labelledby="newproj-offline-heading">
        <h2 id="newproj-offline-heading" className="cc-portal-client-shell-title">
          Start a new project
        </h2>
        <p className="cc-portal-client-description mt-3 max-w-xl font-medium">
          The create-project form needs the database to list clients and save projects. Connect <code className="font-mono text-[11px]">DATABASE_URL</code>{" "}
          first, then refresh this page.
        </p>
        <p className="mt-4 font-body text-sm text-burgundy/60">
          Tip: you can still use{" "}
          <Link href="/portal/faq-suggestions" className="font-medium text-burgundy underline underline-offset-2">
            FAQ queue
          </Link>{" "}
          and header links to explore static areas.
        </p>
      </section>
    </div>
  );
}
