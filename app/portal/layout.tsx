import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getPortalDatabaseAvailable } from "@/lib/portal-db-status";
import { isStudioUser } from "@/lib/portal-access";
import { PortalBottomSpacer } from "@/components/portal/PortalBottomSpacer";
import { PortalChrome } from "@/components/portal/PortalChrome";
import { PortalSmoothScroll } from "@/components/portal/PortalSmoothScroll";
import { PORTAL_AUTH_SHELL_HEADER } from "@/lib/portal-auth-shell-header";
import { PortalProviders } from "./providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client portal | Collectiv. Studio",
  description: "Track your project, review social content, and share website kit assets.",
};

/** App-like mobile / tablet: safe areas, status bar tint, notched devices */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#f2edeb",
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const isAuthShell = headers().get(PORTAL_AUTH_SHELL_HEADER) === "1";

  if (isAuthShell) {
    return (
      <PortalProviders>
        <PortalSmoothScroll />
        <div className="portal-app-shell flex min-h-dvh flex-col overscroll-y-contain bg-cream text-burgundy [color-scheme:light] [-webkit-tap-highlight-color:rgba(37,13,24,0.07)] [&_a]:touch-manipulation [&_button]:touch-manipulation">
          <div className="mx-auto flex w-full max-w-[min(100%,1280px)] flex-1 flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-6 sm:px-5 sm:pt-8 md:px-8 md:pt-10 lg:px-10 lg:pb-24 lg:pt-12">
            {children}
          </div>
        </div>
      </PortalProviders>
    );
  }

  const session = await getServerSession(authOptions);
  const studio = isStudioUser(session?.user?.email);
  const dbAvailable = await getPortalDatabaseAvailable();

  let studioPersonaSlug: string | null = null;
  let clientNotificationUnread = 0;

  if (dbAvailable && session?.user?.id) {
    try {
      if (studio) {
        const m = await prisma.studioTeamMember.findUnique({
          where: { userId: session.user.id },
          select: { personaSlug: true },
        });
        studioPersonaSlug = m?.personaSlug ?? null;
      } else {
        clientNotificationUnread = await prisma.clientNotification.count({
          where: { userId: session.user.id, readAt: null },
        });
      }
    } catch {
      /* treat as offline for chrome counts */
    }
  }

  /** Demo badge so the alerts affordance is testable without a DB. */
  const clientBellUnread =
    !studio && session?.user?.id ? (dbAvailable ? clientNotificationUnread : 2) : 0;

  return (
    <PortalProviders>
      <PortalSmoothScroll />
      <div
        className="portal-app-shell flex min-h-dvh flex-col overscroll-y-contain bg-cream text-burgundy [color-scheme:light] [-webkit-tap-highlight-color:rgba(37,13,24,0.07)] [--portal-sticky-offset:calc(3.35rem+env(safe-area-inset-top,0px))] lg:[--portal-sticky-offset:4.35rem] [&_a]:touch-manipulation [&_button]:touch-manipulation"
      >
        <PortalChrome
          showStudioLinks={studio}
          isAgencyAdmin={studio}
          showStudioSocialCalendarLink={studioPersonaSlug !== "isabella"}
          isClientUser={!studio && !!session?.user?.id}
          clientNotificationUnread={clientBellUnread}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className={`mx-auto flex w-full flex-1 flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-6 sm:px-5 sm:pt-8 md:px-8 md:pt-10 lg:px-10 lg:pb-24 lg:pt-12 ${
              studio ? "max-w-[min(100%,1400px)]" : "max-w-[min(100%,1280px)]"
            }`}
          >
            {children}
          </div>
          <PortalBottomSpacer showStudio={studio} showClientMobileNav={!studio && !!session?.user?.id} />
        </div>
      </div>
    </PortalProviders>
  );
}
