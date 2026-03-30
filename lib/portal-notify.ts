import { studioEmailSet } from "@/lib/portal-studio-users";
import { sendResendEmail } from "@/lib/resend-email";
import { isSafeWebhookUrl } from "@/lib/webhook-url";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Notify the studio when a client registers.
 * - Set `PORTAL_STUDIO_NOTIFY_WEBHOOK` for Zapier/Make (or any POST endpoint).
 * - Optionally set `RESEND_API_KEY` + `STUDIO_NOTIFICATION_EMAIL` (or rely on first `STUDIO_EMAIL`) for email.
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

  const explicitTo = process.env.STUDIO_NOTIFICATION_EMAIL?.trim();
  const fallbackTo = Array.from(studioEmailSet())[0];
  const studioTo = explicitTo || fallbackTo;
  if (studioTo) {
    await sendResendEmail({
      to: studioTo,
      subject: `New portal registration: ${payload.email}`,
      html: `<p>A new client registered for the portal.</p><p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>${
        payload.name ? `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>` : ""
      }${payload.phone ? `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>` : ""}<p><strong>Registered at:</strong> ${escapeHtml(registeredAt)}</p>`,
    });
  }

  if (!url && !process.env.RESEND_API_KEY?.trim() && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[portal] Client registered (set PORTAL_STUDIO_NOTIFY_WEBHOOK or RESEND_API_KEY):", body);
  }
}
