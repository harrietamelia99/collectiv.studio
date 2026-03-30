/**
 * Optional Pusher broadcast so open calendar pages can refresh without manual reload.
 * Set PUSHER_APP_ID, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER in .env to enable.
 */
export function calendarRealtimeConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID?.trim() &&
      process.env.PUSHER_SECRET?.trim() &&
      process.env.NEXT_PUBLIC_PUSHER_KEY?.trim() &&
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim(),
  );
}

export async function triggerProjectCalendarRefresh(projectId: string): Promise<void> {
  if (!calendarRealtimeConfigured()) return;
  try {
    const Pusher = (await import("pusher")).default;
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
    await pusher.trigger(`project-${projectId}-calendar`, "refresh", { at: Date.now() });
  } catch {
    // Non-fatal: polling fallback still works
  }
}
