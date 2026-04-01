"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Palette,
  UserCircle,
} from "lucide-react";

function useHash(): string {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}

const itemBase =
  "flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1.5 pt-1 text-center transition-colors active:opacity-80 rounded-xl hover:bg-burgundy/[0.06]";

const iconClass = "h-6 w-6 shrink-0 stroke-[1.5]";

type Props = {
  showStudioLinks: boolean;
  showStudioSocialCalendarLink?: boolean;
  isClientUser: boolean;
  clientNotificationUnread: number;
};

export function PortalBottomNav({
  showStudioLinks,
  showStudioSocialCalendarLink = true,
  isClientUser,
  clientNotificationUnread,
}: Props) {
  const pathname = usePathname() || "";
  const hash = useHash();

  if (showStudioLinks) {
    const onDashboard = pathname === "/portal" || pathname === "/portal/";
    const inboxActive = onDashboard && hash === "#studio-comms";
    const dashActive = onDashboard && !inboxActive;
    const faqActive = pathname.startsWith("/portal/faq-suggestions");
    const calActive = pathname.startsWith("/portal/studio-social-calendar");

    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-[90] border-t border-zinc-200/90 bg-cream/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(37,13,24,0.06)] backdrop-blur-xl lg:hidden"
        aria-label="Primary portal navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5 px-1 pt-2">
          <Link
            href="/portal"
            className={`${itemBase} ${dashActive ? "text-burgundy" : "text-burgundy/45"}`}
            aria-current={dashActive ? "page" : undefined}
          >
            <LayoutDashboard className={`${iconClass} ${dashActive ? "text-burgundy" : "text-burgundy/50"}`} />
            <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em]">Home</span>
          </Link>
          <Link
            href="/portal#studio-comms"
            className={`${itemBase} ${inboxActive ? "text-burgundy" : "text-burgundy/45"}`}
            aria-current={inboxActive ? "page" : undefined}
          >
            <MessageSquare className={`${iconClass} ${inboxActive ? "text-burgundy" : "text-burgundy/50"}`} />
            <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em]">Inbox</span>
          </Link>
          {showStudioSocialCalendarLink ? (
            <Link
              href="/portal/studio-social-calendar"
              className={`${itemBase} ${calActive ? "text-burgundy" : "text-burgundy/45"}`}
              aria-current={calActive ? "page" : undefined}
            >
              <CalendarDays className={`${iconClass} ${calActive ? "text-burgundy" : "text-burgundy/50"}`} />
              <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em]">Calendar</span>
            </Link>
          ) : null}
          <Link
            href="/portal/faq-suggestions"
            className={`${itemBase} ${faqActive ? "text-burgundy" : "text-burgundy/45"}`}
            aria-current={faqActive ? "page" : undefined}
          >
            <CircleHelp className={`${iconClass} ${faqActive ? "text-burgundy" : "text-burgundy/50"}`} />
            <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em]">FAQ</span>
          </Link>
        </div>
      </nav>
    );
  }

  if (!isClientUser) return null;

  const projectsActive = pathname === "/portal" || pathname === "/portal/";
  const notificationsActive = pathname.startsWith("/portal/notifications");
  const brandActive = pathname.startsWith("/portal/brand-kit");
  const accountActive = pathname.startsWith("/portal/account");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-zinc-200/90 bg-cream/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(37,13,24,0.06)] backdrop-blur-xl md:hidden"
      aria-label="Primary portal navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5 px-1 pt-2">
        <Link
          href="/portal"
          className={`${itemBase} ${projectsActive ? "text-burgundy" : "text-burgundy/45"}`}
          aria-current={projectsActive ? "page" : undefined}
        >
          <FolderKanban className={`${iconClass} ${projectsActive ? "text-burgundy" : "text-burgundy/50"}`} />
          <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em]">Projects</span>
        </Link>
        <Link
          href="/portal/notifications"
          className={`${itemBase} relative ${notificationsActive ? "text-burgundy" : "text-burgundy/45"}`}
          aria-current={notificationsActive ? "page" : undefined}
        >
          <Bell className={`${iconClass} ${notificationsActive ? "text-burgundy" : "text-burgundy/50"}`} />
          {clientNotificationUnread > 0 ? (
            <span className="absolute right-2 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-burgundy px-1 font-body text-[8px] font-bold text-cream">
              {clientNotificationUnread > 9 ? "9+" : clientNotificationUnread}
            </span>
          ) : null}
          <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em]">Alerts</span>
        </Link>
        <Link
          href="/portal/account"
          className={`${itemBase} ${accountActive ? "text-burgundy" : "text-burgundy/45"}`}
          aria-current={accountActive ? "page" : undefined}
        >
          <UserCircle className={`${iconClass} ${accountActive ? "text-burgundy" : "text-burgundy/50"}`} />
          <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em]">Account</span>
        </Link>
        <Link
          href="/portal/brand-kit"
          className={`${itemBase} ${brandActive ? "text-burgundy" : "text-burgundy/45"}`}
          aria-current={brandActive ? "page" : undefined}
        >
          <Palette className={`${iconClass} ${brandActive ? "text-burgundy" : "text-burgundy/50"}`} />
          <span className="font-body text-[9px] font-semibold uppercase tracking-[0.1em]">Brand</span>
        </Link>
      </div>
    </nav>
  );
}
