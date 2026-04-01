import { prisma } from "@/lib/prisma";
import type { ContactApiFullBody, ContactApiHomeBody } from "@/lib/marketing-contact-body";

const NOTIFICATION_HREF = "/portal#studio-notifications";

/** Issy / operations — portal bell + inbox row on the agency dashboard. */
async function issyUserId(): Promise<string | null> {
  const row = await prisma.studioTeamMember.findFirst({
    where: {
      OR: [{ personaSlug: "isabella" }, { studioRole: "ISSY" }],
    },
    select: { userId: true },
  });
  return row?.userId ?? null;
}

function buildNotificationCopy(data: ContactApiHomeBody | ContactApiFullBody): { title: string; body: string } {
  if (data.source === "home") {
    return {
      title: `New enquiry from ${data.email}`,
      body: `Home page contact form. Email: ${data.email}`,
    };
  }
  const name = `${data.firstName} ${data.lastName}`.trim();
  const company = data.businessName?.trim();
  const fromCompany = company ? ` from ${company}` : "";
  return {
    title: `New enquiry from ${name}`,
    body: `${name}${fromCompany} sent an enquiry via the website. Email: ${data.email}`,
  };
}

/**
 * In-portal notification for Issy after a marketing `/api/contact` submission succeeds
 * (home strip or full discovery form).
 * Does not throw — callers should still wrap in try/catch and log.
 */
export async function notifyIssyOfMarketingContact(data: ContactApiHomeBody | ContactApiFullBody): Promise<void> {
  const userId = await issyUserId();
  if (!userId) {
    // eslint-disable-next-line no-console
    console.warn("[contact-form] Issy studio member not found — skipping portal notification");
    return;
  }

  const { title, body } = buildNotificationCopy(data);

  await prisma.studioNotification.create({
    data: {
      userId,
      kind: "CONTACT_FORM_ENQUIRY",
      title,
      body,
      href: NOTIFICATION_HREF,
    },
  });
}

/**
 * Same Issy recipient as contact forms — homepage launch-list modal (`/api/launch-signup`).
 */
export async function notifyIssyOfLaunchListSignup(email: string): Promise<void> {
  const userId = await issyUserId();
  if (!userId) {
    // eslint-disable-next-line no-console
    console.warn("[launch-signup] Issy studio member not found — skipping portal notification");
    return;
  }

  await prisma.studioNotification.create({
    data: {
      userId,
      kind: "LAUNCH_LIST_SIGNUP",
      title: `Launch list signup: ${email}`,
      body: "Someone joined the mailing list from the homepage launch modal.",
      href: NOTIFICATION_HREF,
    },
  });
}
