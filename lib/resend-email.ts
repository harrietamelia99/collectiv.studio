import { getResend, getResendFromEmail } from "@/lib/resend";

export type ResendConfig = { apiKey: string; from: string };

export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey, from: getResendFromEmail() };
}

/** Returns whether the send was accepted (no API/transport error). */
export async function sendResendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const from = getResendFromEmail();
  const to = Array.isArray(params.to) ? params.to : [params.to];
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[sendResendEmail] Resend API error", error);
      return false;
    }
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[sendResendEmail] send failed", e);
    return false;
  }
}
