export type ResendConfig = { apiKey: string; from: string };

export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  return { apiKey, from };
}

/** Returns whether the HTTP request was accepted (2xx). */
export async function sendResendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  const cfg = getResendConfig();
  if (!cfg) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        from: cfg.from,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
