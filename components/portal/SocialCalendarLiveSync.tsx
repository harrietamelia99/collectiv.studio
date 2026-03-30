"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_NO_CHANNEL_MS = 28_000;
const POLL_WITH_PUSHER_MS = 90_000;

type Props = {
  /** When set, subscribes to `project-{id}-calendar` refresh events (Pusher). */
  projectId?: string;
};

export function SocialCalendarLiveSync({ projectId }: Props) {
  const router = useRouter();
  const pusherRef = useRef<{ disconnect: () => void } | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY?.trim();
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim();
    const hasPusher = Boolean(key && cluster && projectId);

    let cancelled = false;

    if (hasPusher && projectId) {
      void import("pusher-js").then(({ default: Pusher }) => {
        if (cancelled) return;
        const pusher = new Pusher(key!, { cluster: cluster! });
        pusherRef.current = pusher;
        const ch = pusher.subscribe(`project-${projectId}-calendar`);
        ch.bind("refresh", () => router.refresh());
      });
    }

    const pollMs = hasPusher ? POLL_WITH_PUSHER_MS : POLL_NO_CHANNEL_MS;
    const pollId = window.setInterval(() => router.refresh(), pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
      try {
        pusherRef.current?.disconnect();
      } catch {
        /* ignore */
      }
      pusherRef.current = null;
    };
  }, [projectId, router]);

  return null;
}
