"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CircleHelp,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
} from "lucide-react";
import { PortalBottomNav } from "@/components/portal/PortalBottomNav";
import { ctaButtonClasses } from "@/components/ui/Button";

type Props = {
  showStudioLinks?: boolean;
  isAgencyAdmin?: boolean;
  showStudioSocialCalendarLink?: boolean;
  isClientUser?: boolean;
  clientNotificationUnread?: number;
};

const navIcon = "h-3.5 w-3.5 shrink-0 stroke-[1.75]";

export function PortalChrome({
  showStudioLinks = false,
  isAgencyAdmin = false,
  showStudioSocialCalendarLink = true,
  isClientUser = false,
  clientNotificationUnread = 0,
}: Props) {
  const pathname = usePathname() || "";
  const wideNavPrefix = showStudioLinks ? "lg" : "md";
  /** Client nav switches to the full row at `md`; keep the wordmark area minimal until `lg` to avoid crowding My projects / Alerts. */
  const clientCompactWordmark = isClientUser && !showStudioLinks;
  const portalHomeActive = pathname === "/portal" || pathname === "/portal/";
  const notificationsActive = pathname.startsWith("/portal/notifications");
  const brandKitActive = pathname.startsWith("/portal/brand-kit");
  const studioSocialCalActive = pathname.startsWith("/portal/studio-social-calendar");

  const linkBase =
    "group inline-flex min-h-[44px] max-w-full items-center gap-1.5 rounded-xl px-2 py-2 font-body text-[10px] uppercase tracking-[0.1em] no-underline outline-offset-4 transition-colors sm:px-2.5 sm:text-[11px]";

  return (
    <>
      <header className="portal-chrome-header sticky top-0 z-[100] border-b border-zinc-200/90 bg-cream pt-[max(0.5rem,env(safe-area-inset-top))] shadow-sm">
        <div className="mx-auto flex min-h-[48px] max-w-[min(100%,1440px)] items-center justify-between gap-3 px-4 sm:px-6 md:px-10 lg:min-h-[52px]">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4 md:gap-5">
            <Link
              href="/"
              className="touch-manipulation shrink-0 font-display text-xl leading-none tracking-[-0.04em] text-burgundy no-underline transition-opacity active:opacity-70 sm:text-2xl"
            >
              Collectiv<span className="align-super text-[0.55em]">®</span>
            </Link>
            <span
              className={`hidden w-px shrink-0 self-stretch bg-burgundy/12 ${clientCompactWordmark ? "lg:block" : "sm:block"}`}
              aria-hidden
            />
            <span
              className={`hidden font-body text-[10px] font-normal uppercase tracking-[0.14em] ${clientCompactWordmark ? "lg:inline" : "sm:inline"} ${
                isAgencyAdmin ? "text-burgundy/50" : "text-burgundy"
              }`}
            >
              {isAgencyAdmin ? "Agency portal" : "Client portal"}
            </span>
          </div>

          <div
            className={`hidden min-w-0 shrink-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-2 sm:gap-x-2 ${wideNavPrefix === "lg" ? "lg:flex" : "md:flex"}`}
          >
            <Link
              href="/portal"
              className={`${linkBase} ${
                portalHomeActive
                  ? "bg-burgundy/[0.1] font-semibold text-burgundy ring-1 ring-burgundy/20 hover:bg-burgundy/[0.14]"
                  : "text-burgundy hover:bg-burgundy/[0.06]"
              }`}
            >
              {isAgencyAdmin ? (
                <LayoutDashboard
                  className={`${navIcon} ${portalHomeActive ? "text-burgundy" : "text-burgundy/65 group-hover:text-burgundy"}`}
                />
              ) : (
                <FolderKanban
                  className={`${navIcon} ${portalHomeActive ? "text-burgundy" : "text-burgundy/65 group-hover:text-burgundy"}`}
                />
              )}
              {isAgencyAdmin ? "Dashboard" : "My projects"}
            </Link>
            {isClientUser ? (
              <Link
                href="/portal/notifications"
                className={`${linkBase} relative ${
                  notificationsActive
                    ? "bg-burgundy/[0.1] font-semibold text-burgundy ring-1 ring-burgundy/20 hover:bg-burgundy/[0.14]"
                    : "text-burgundy hover:bg-burgundy/[0.06]"
                }`}
              >
                <Bell
                  className={`${navIcon} ${notificationsActive ? "text-burgundy" : "text-burgundy/65 group-hover:text-burgundy"}`}
                />
                Alerts
                {clientNotificationUnread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-burgundy px-1 font-body text-[9px] font-bold text-cream">
                    {clientNotificationUnread > 9 ? "9+" : clientNotificationUnread}
                  </span>
                ) : null}
              </Link>
            ) : null}
            {isClientUser ? (
              <Link
                href="/portal/brand-kit"
                className={`${linkBase} ${
                  brandKitActive
                    ? "bg-burgundy/[0.1] font-semibold text-burgundy ring-1 ring-burgundy/20 hover:bg-burgundy/[0.14]"
                    : "text-burgundy hover:bg-burgundy/[0.06]"
                }`}
              >
                <Palette
                  className={`${navIcon} ${brandKitActive ? "text-burgundy" : "text-burgundy/65 group-hover:text-burgundy"}`}
                />
                Brand kit
              </Link>
            ) : null}
            {showStudioLinks ? (
              <Link
                href="/portal#studio-comms"
                className={`${linkBase} text-burgundy hover:bg-burgundy/[0.06]`}
              >
                <MessageSquare className={`${navIcon} text-burgundy/65 group-hover:text-burgundy`} />
                Inbox &amp; team
              </Link>
            ) : null}
            {showStudioLinks ? (
              <Link href="/portal/faq-suggestions" className={`${linkBase} text-burgundy hover:bg-burgundy/[0.06]`}>
                <CircleHelp className={`${navIcon} text-burgundy/65 group-hover:text-burgundy`} />
                FAQ queue
              </Link>
            ) : null}
            {showStudioLinks && showStudioSocialCalendarLink ? (
              <Link
                href="/portal/studio-social-calendar"
                className={`${linkBase} ${
                  studioSocialCalActive
                    ? "bg-burgundy/[0.1] font-semibold text-burgundy ring-1 ring-burgundy/20 hover:bg-burgundy/[0.14]"
                    : "text-burgundy hover:bg-burgundy/[0.06]"
                }`}
              >
                <CalendarDays
                  className={`${navIcon} ${studioSocialCalActive ? "text-burgundy" : "text-burgundy/65 group-hover:text-burgundy"}`}
                />
                Social calendar
              </Link>
            ) : null}
            <Link
              href="/"
              className={`${linkBase} text-burgundy/55 hover:bg-burgundy/[0.05] hover:text-burgundy`}
            >
              <Globe className={`${navIcon} text-burgundy/50 group-hover:text-burgundy`} />
              Main site
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={ctaButtonClasses({
                variant: "outline",
                size: "sm",
                lift: false,
                className: "touch-manipulation px-4 py-2.5 text-[10px] min-h-[44px]",
              })}
            >
              Sign out
            </button>
          </div>

          {/* Mobile / narrow: compact header — primary nav is the bottom tab bar */}
          <div
            className={`flex shrink-0 items-center gap-2 ${wideNavPrefix === "lg" ? "lg:hidden" : "md:hidden"}`}
          >
            <Link
              href="/"
              title="Main site"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-burgundy/15 text-burgundy/60 transition-colors hover:border-burgundy/30 hover:bg-burgundy/[0.05] hover:text-burgundy"
            >
              <Globe className="h-5 w-5 stroke-[1.5]" aria-hidden />
              <span className="sr-only">Main site</span>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-burgundy/15 text-burgundy transition-colors hover:border-burgundy/30 hover:bg-burgundy/[0.05]"
            >
              <LogOut className="h-5 w-5 shrink-0 stroke-[1.75]" aria-hidden />
              <span className="sr-only">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <PortalBottomNav
        showStudioLinks={showStudioLinks}
        showStudioSocialCalendarLink={showStudioSocialCalendarLink}
        isClientUser={isClientUser}
        clientNotificationUnread={clientNotificationUnread}
      />
    </>
  );
}
