"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Kicks off studio todo sync after first paint, then refreshes RSC data so the dashboard reflects updates.
 */
export function StudioHomeHeavySyncTrigger() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void fetch("/api/portal/studio-home-sync", { method: "POST" })
      .then((res) => {
        if (res.ok) router.refresh();
      })
      .catch(() => {
        /* non-blocking; user can refresh manually */
      });
  }, [router]);

  return null;
}
