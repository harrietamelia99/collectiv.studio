/**
 * Optional webhook when a client completes portal registration (Zapier, Make, Slack, etc.).
 * Configure `STUDIO_CLIENT_REGISTERED_WEBHOOK` in `.env`.
 */
export async function notifyStudioClientRegistered(payload: {
  email: string;
  name: string | null;
}): Promise<void> {
  const url = process.env.STUDIO_CLIENT_REGISTERED_WEBHOOK?.trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "client_registered",
        email: payload.email,
        name: payload.name,
        at: new Date().toISOString(),
      }),
    });
  } catch {
    // Non-blocking: registration must succeed even if notification fails.
  }
}
