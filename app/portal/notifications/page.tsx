import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getPortalDatabaseAvailable } from "@/lib/portal-db-status";
import { isStudioUser } from "@/lib/portal-access";
import { markAllClientNotificationsRead, markClientNotificationRead } from "@/app/portal/actions";
import { ClientNotificationsDemoList } from "@/components/portal/ClientNotificationsDemoList";
import { PortalDatabaseOfflineBanner } from "@/components/portal/PortalDatabaseOfflineBanner";
import { ctaButtonClasses } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const DEMO_NOTIFICATIONS: {
  id: string;
  title: string;
  body: string;
  href: string | null;
  createdLabel: string;
}[] = [
  {
    id: "demo-1",
    title: "New message in your project",
    body: "The studio left a note on your website project — open Messages to reply.",
    href: "/portal",
    createdLabel: "Sample",
  },
  {
    id: "demo-2",
    title: "Content ready for review",
    body: "When your real calendar is connected, post approvals will show here.",
    href: null,
    createdLabel: "Sample",
  },
];

export default async function ClientNotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/portal/login");
  if (isStudioUser(session.user.email)) redirect("/portal");

  const dbAvailable = await getPortalDatabaseAvailable();
  let rows: Awaited<ReturnType<typeof prisma.clientNotification.findMany>> = [];
  let notificationsLoadFailed = false;
  if (dbAvailable) {
    try {
      rows = await prisma.clientNotification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    } catch {
      notificationsLoadFailed = true;
      rows = [];
    }
  }

  /** Sample rows when DB is off or the notifications query failed mid-session. */
  const showDemo = !dbAvailable || notificationsLoadFailed;
  const listItems = showDemo
    ? DEMO_NOTIFICATIONS.map((d) => ({
        id: d.id,
        title: d.title,
        body: d.body,
        href: d.href,
        readAt: null as Date | null,
        createdAt: new Date(0),
        isDemo: true,
        createdLabel: d.createdLabel,
      }))
    : rows.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        href: n.href,
        readAt: n.readAt,
        createdAt: n.createdAt,
        isDemo: false,
        createdLabel: null as string | null,
      }));

  return (
    <div>
      <Link
        href="/portal"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← My projects
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Alerts</h1>
      <p className="mt-3 max-w-xl font-body text-sm text-burgundy/70">
        Updates when the studio messages you, uploads files, or adds calendar content. Email may also be sent when
        enabled.
      </p>

      {!dbAvailable ? <PortalDatabaseOfflineBanner /> : null}
      {showDemo ? <ClientNotificationsDemoList /> : null}

      {dbAvailable && !notificationsLoadFailed && rows.some((r) => !r.readAt) ? (
        <form action={markAllClientNotificationsRead} className="mt-6">
          <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
            Mark all as read
          </button>
        </form>
      ) : null}

      <ul className="mt-8 flex max-w-2xl flex-col gap-3">
        {listItems.length === 0 ? (
          <li className="rounded-xl border border-dashed border-burgundy/20 bg-white px-5 py-10 text-center font-body text-sm text-burgundy/60">
            You&apos;re all caught up — nothing here yet.
          </li>
        ) : (
          listItems.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm ${
                n.readAt ? "opacity-75" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {n.href ? (
                    <Link
                      href={n.href}
                      className="font-display text-base font-medium tracking-[-0.02em] text-burgundy underline decoration-burgundy/25 underline-offset-4 hover:decoration-burgundy/50"
                    >
                      {n.title}
                    </Link>
                  ) : (
                    <span className="font-display text-base font-medium tracking-[-0.02em] text-burgundy">{n.title}</span>
                  )}
                  {n.body ? (
                    <p className="mt-1 font-body text-sm leading-relaxed text-burgundy/70">{n.body}</p>
                  ) : null}
                  <p className="mt-2 font-body text-[11px] tabular-nums text-burgundy/45">
                    {n.isDemo
                      ? `${n.createdLabel} · not saved`
                      : n.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    {n.readAt ? " · Read" : ""}
                  </p>
                </div>
                {!n.readAt && !n.isDemo ? (
                  <form action={markClientNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
                      Mark read
                    </button>
                  </form>
                ) : !n.readAt && n.isDemo ? (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-body text-[11px] text-burgundy/55">
                    Demo — connect DB to mark read
                  </span>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
