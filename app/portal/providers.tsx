"use client";

import { SessionProvider } from "next-auth/react";
import { PortalHashScroll } from "@/components/portal/PortalHashScroll";

export function PortalProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PortalHashScroll />
      {children}
    </SessionProvider>
  );
}
