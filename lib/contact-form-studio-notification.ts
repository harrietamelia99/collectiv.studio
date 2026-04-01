import { prisma } from "@/lib/prisma";
import type { ContactApiFullBody, ContactApiHomeBody } from "@/lib/marketing-contact-body";

const NOTIFICATION_KIND = "CONTACT_FORM_ENQUIRY";
const NOTIFICATION_HREF = "/portal#studio-notifications";

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
 * In-portal bell notification for Issy after a marketing contact form succeeds.
 * Does not throw — callers should still wrap in try/catch and log.
 */
export async function notifyIssyOfMarketingContact(data: ContactApiHomeBody | ContactApiFullBody): Promise<void> {
  const issy = await prisma.studioTeamMember.findFirst({
    where: {
      OR: [{ personaSlug: "isabella" }, { studioRole: "ISSY" }],
    },
    select: { userId: true },
  });

  if (!issy) {
    // eslint-disable-next-line no-console
    console.warn("[contact-form] Issy studio member not found — skipping portal notification");
    return;
  }

  const { title, body } = buildNotificationCopy(data);

  await prisma.studioNotification.create({
    data: {
      userId: issy.userId,
      kind: NOTIFICATION_KIND,
      title,
      body,
      href: NOTIFICATION_HREF,
    },
  });
}
