"use client";

import { SessionProvider } from "next-auth/react";

/** Lets the marketing navbar read auth state for portal / login links. */
export function SiteSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
