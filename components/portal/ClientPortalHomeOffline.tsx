import type { Session } from "next-auth";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { FolderKanban } from "lucide-react";

type Props = { session: Session };

/** Client portal home when the database is unavailable — keeps layout and explains next steps. */
export function ClientPortalHomeOffline({ session }: Props) {
  const name =
    session.user?.name?.trim()?.split(/\s+/)[0] ||
    session.user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="space-y-8 pb-8">
      <header className="max-w-2xl min-w-0 border-l-2 border-burgundy pl-3 sm:border-l-4 sm:pl-5">
        <p className="font-body text-[0.65rem] font-bold uppercase tracking-[0.1em] text-burgundy sm:text-xs sm:tracking-[0.12em]">
          Client portal
        </p>
        <h1 className="mt-3 break-words font-display text-cc-h2 tracking-[-0.03em] text-burgundy sm:mt-4">
          Welcome, <span className="italic">{name}</span>
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-burgundy/75 sm:text-base">
          You&apos;re signed in, but projects couldn&apos;t be loaded because the database isn&apos;t connected. After your
          host sets <code className="rounded bg-burgundy/[0.06] px-1 font-mono text-[11px]">DATABASE_URL</code>, your real
          projects and progress will appear here.
        </p>
      </header>

      <section className="cc-portal-client-shell" aria-labelledby="offline-progress-demo">
        <h2 id="offline-progress-demo" className="cc-portal-client-shell-title">
          How progress will look
        </h2>
        <p className="mt-3 max-w-xl cc-portal-client-description font-medium">
          Example bar only — not saved data.
        </p>
        <div className="mt-6 max-w-xl">
          <PhaseProgressBar
            label="Overall progress (demo)"
            percent={35}
            variant="panel"
            hint="When the database is live, this reflects your real website, social, branding, and other steps."
          />
        </div>
      </section>

      <section className="cc-portal-client-shell" aria-labelledby="offline-projects-heading">
        <h2 id="offline-projects-heading" className="cc-portal-client-shell-title">
          Your projects &amp; subscriptions
        </h2>
        <div className="mt-4">
          <PortalEmptyState
            icon={FolderKanban}
            title="Projects load from the database"
            description="Nothing to show yet in offline mode. Alerts and brand kit links in the header still work for navigation."
          />
        </div>
      </section>
    </div>
  );
}
