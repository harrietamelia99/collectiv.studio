import { emailNotifyStudioNewClientRegistered } from "@/lib/email-notifications";
import { isSafeWebhookUrl } from "@/lib/webhook-url";

/**
 * Notify the studio when a client registers.
 * - Set `PORTAL_STUDIO_NOTIFY_WEBHOOK` for Zapier/Make (or any POST endpoint).
 * - With `RESEND_API_KEY`, sends a branded email to Issy (isabella persona), with fallback to `STUDIO_NOTIFICATION_EMAIL` or first `STUDIO_EMAIL`.
 */
export async function notifyStudioClientRegistered(payload: {
  email: string;
  name: string | null;
  phone?: string | null;
}): Promise<void> {
  const registeredAt = new Date().toISOString();
  const body = JSON.stringify({
    event: "client_registered",
    email: payload.email,
    name: payload.name,
    phone: payload.phone ?? null,
    registeredAt,
    message: `New portal registration: ${payload.email}${payload.name ? ` (${payload.name})` : ""}${payload.phone ? ` · ${payload.phone}` : ""}`,
  });

  const url = process.env.PORTAL_STUDIO_NOTIFY_WEBHOOK?.trim();
  if (url) {
    if (isSafeWebhookUrl(url)) {
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } catch {
        /* Registration must succeed even if webhook fails */
      }
    } else if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("[portal] PORTAL_STUDIO_NOTIFY_WEBHOOK rejected by URL safety check");
    }
  }

  await emailNotifyStudioNewClientRegistered({
    clientEmail: payload.email,
    clientName: payload.name,
    clientPhone: payload.phone ?? null,
  });

  if (!url && !process.env.RESEND_API_KEY?.trim() && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[portal] Client registered (set PORTAL_STUDIO_NOTIFY_WEBHOOK or RESEND_API_KEY):", body);
  }
}
