import { prisma } from "@/lib/prisma";
import { getResend, getResendFromEmail } from "@/lib/resend";
import { studioEmailSet } from "@/lib/portal-studio-users";

export const COLLECTIV_BURGUNDY = "#250d18";
export const COLLECTIV_CREAM = "#f2edeb";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function portalOrigin(): string {
  const raw = process.env.NEXTAUTH_URL?.trim() || "http://127.0.0.1:3333";
  return raw.replace(/\/$/, "");
}

/**
 * Shared transactional layout: burgundy + cream, warm professional tone.
 */
export function collectivEmailShell(opts: {
  greetingHtml: string;
  bodyParagraphsHtml: string[];
  detailHtml?: string | null;
  cta?: { href: string; label: string };
  footerLine?: string | null;
}): string {
  const detail = opts.detailHtml
    ? `<div style="margin:20px 0;padding:18px 20px;background:#ffffff;border:1px solid #e5ddd8;border-radius:8px;color:${COLLECTIV_BURGUNDY};font-size:14px;line-height:1.6;">${opts.detailHtml}</div>`
    : "";
  const paras = opts.bodyParagraphsHtml
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3d2a2f;">${p}</p>`,
    )
    .join("");
  const cta = opts.cta
    ? `<p style="margin:28px 0 0;"><a href="${escapeHtml(opts.cta.href)}" style="display:inline-block;padding:12px 22px;background:${COLLECTIV_BURGUNDY};color:${COLLECTIV_CREAM};text-decoration:none;font-size:14px;border-radius:4px;font-weight:600;">${escapeHtml(
        opts.cta.label,
      )}</a></p>`
    : "";
  const foot = opts.footerLine
    ? `<p style="margin:24px 0 0;font-size:12px;color:#6b5a5e;">${opts.footerLine}</p>`
    : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:28px 24px;font-family:Georgia,'Times New Roman',serif;background:${COLLECTIV_CREAM};color:${COLLECTIV_BURGUNDY};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;"><tr><td>
<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6b5a5e;">Collectiv. Studio</p>
<p style="margin:0 0 20px;font-size:17px;font-weight:600;color:${COLLECTIV_BURGUNDY};">Client portal</p>
${opts.greetingHtml}
${paras}
${detail}
${cta}
<p style="margin:28px 0 0;font-size:13px;color:#6b5a5e;line-height:1.5;">Warmly,<br/>Collectiv. Studio</p>
${foot}
</td></tr></table></body></html>`;
}

export async function sendBrandedTransactional(params: {
  to: string | string[];
  subject: string;
  html: string;
  logTag: string;
}): Promise<void> {
  const resend = getResend();
  const from = getResendFromEmail();
  const toList = (Array.isArray(params.to) ? params.to : [params.to])
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (toList.length === 0) return;

  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(`[email:${params.logTag}] skipped (no RESEND_API_KEY)`, {
        to: toList,
        subject: params.subject,
      });
    }
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: toList,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`[email:${params.logTag}] Resend API error`, error);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[email:${params.logTag}] send failed`, e);
  }
}

async function emailsForUserIds(userIds: string[]): Promise<string[]> {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { email: true },
  });
  return users.map((u) => u.email.trim().toLowerCase()).filter(Boolean);
}

async function emailForPersona(personaSlug: string): Promise<string | null> {
  const row = await prisma.studioTeamMember.findFirst({
    where: { personaSlug: personaSlug },
    include: { user: { select: { email: true } } },
  });
  const e = row?.user?.email?.trim().toLowerCase();
  return e || null;
}

// --- Client: invited (welcome + registration link) ---

export async function emailNotifyClientInvitedToPortal(opts: {
  to: string;
  firstName: string;
  registerUrl: string;
}): Promise<void> {
  const name = opts.firstName.trim() || "there";
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi ${escapeHtml(name)},</p>`,
    bodyParagraphsHtml: [
      "You’ve been invited to the <strong>Collectiv. Studio client portal</strong> — a calm place to follow your project, review files, and stay in touch with our team.",
      "Use the button below to set your password and open your hub. This link is personal to you and stays valid for seven days.",
    ],
    cta: { href: opts.registerUrl, label: "Set up your account" },
  });
  await sendBrandedTransactional({
    to: opts.to,
    subject: "You have been invited to the Collectiv. Studio client portal",
    html,
    logTag: "client-invite",
  });
}

/** Self-service registration at /portal/register — not gated by PORTAL_CLIENT_EMAIL_ALERTS (same as invite). */
export async function emailNotifyClientWelcomeAfterSelfRegistration(opts: {
  to: string;
  firstName: string;
}): Promise<void> {
  const name = opts.firstName.trim() || "there";
  const loginUrl = `${portalOrigin()}/portal/login`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi ${escapeHtml(name)},</p>`,
    bodyParagraphsHtml: [
      "Thanks for creating your Collectiv. Studio client account. We’ve received your details and the studio will be in touch with next steps — keep an eye on your inbox.",
      "When you’re ready, sign in to your portal with the email and password you chose.",
    ],
    cta: { href: loginUrl, label: "Sign in to your portal" },
  });
  await sendBrandedTransactional({
    to: opts.to,
    subject: "Welcome to the Collectiv. Studio client portal",
    html,
    logTag: "client-register-welcome",
  });
}

// --- Client: contract ready to sign ---

export async function emailNotifyClientContractReadyToSign(opts: {
  to: string;
  greeting: string;
  projectName: string;
  projectId: string;
}): Promise<void> {
  const path = `/portal/project/${opts.projectId}`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi ${escapeHtml(opts.greeting)},</p>`,
    bodyParagraphsHtml: [
      `Your agreement for <strong>${escapeHtml(opts.projectName)}</strong> is ready to read and sign in the portal.`,
      "Open your project when you’re ready — you’ll find the contract there with a short sign-off step.",
    ],
    cta: { href: `${portalOrigin()}${path}`, label: "Open project & sign" },
    footerLine: escapeHtml(opts.projectName),
  });
  await sendBrandedTransactional({
    to: opts.to,
    subject: `Your agreement is ready to sign · ${opts.projectName}`,
    html,
    logTag: "contract-ready",
  });
}

// --- Issy: client signed contract in portal ---

export async function emailNotifyIssyClientSignedContract(opts: {
  projectName: string;
  projectId: string;
  signedName: string;
  signedAtLabel: string;
  signedIp: string;
  recipientEmails: string[];
}): Promise<void> {
  if (opts.recipientEmails.length === 0) return;
  const openUrl = `${portalOrigin()}/portal/project/${opts.projectId}#agency-onboarding`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hello,</p>`,
    bodyParagraphsHtml: [
      `A client has signed their contract in the portal for <strong>${escapeHtml(opts.projectName)}</strong>.`,
    ],
    detailHtml: `<p style="margin:0 0 8px;"><strong>Signed as:</strong> ${escapeHtml(opts.signedName)}</p><p style="margin:0 0 8px;"><strong>When:</strong> ${escapeHtml(opts.signedAtLabel)}</p><p style="margin:0;"><strong>IP:</strong> ${escapeHtml(opts.signedIp)}</p>`,
    cta: { href: openUrl, label: "Open project" },
  });
  await sendBrandedTransactional({
    to: opts.recipientEmails,
    subject: `Contract signed · ${opts.projectName}`,
    html,
    logTag: "issy-contract-signed",
  });
}

// --- Client: deposit paid, hub unlocked ---

export async function emailNotifyClientDepositPaidHubUnlocked(opts: {
  to: string;
  greeting: string;
  projectName: string;
  projectId: string;
}): Promise<void> {
  const path = `/portal/project/${opts.projectId}`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi ${escapeHtml(opts.greeting)},</p>`,
    bodyParagraphsHtml: [
      `Great news — we’ve confirmed your deposit for <strong>${escapeHtml(opts.projectName)}</strong>.`,
      "Your full project hub is now unlocked in the portal: briefs, files, calendar, and messages are ready when you are.",
    ],
    cta: { href: `${portalOrigin()}${path}`, label: "Open your hub" },
    footerLine: escapeHtml(opts.projectName),
  });
  await sendBrandedTransactional({
    to: opts.to,
    subject: `Deposit received — your hub is unlocked · ${opts.projectName}`,
    html,
    logTag: "deposit-paid-client",
  });
}

// --- Client: new proof / deliverable to review ---

export async function emailNotifyClientAgencyUploadedDeliverable(opts: {
  to: string;
  greeting: string;
  projectName: string;
  assetTitle: string;
  openPath: string;
}): Promise<void> {
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi ${escapeHtml(opts.greeting)},</p>`,
    bodyParagraphsHtml: [
      "We’ve uploaded something new for you to review in your portal.",
    ],
    detailHtml: escapeHtml(opts.assetTitle.slice(0, 400)),
    cta: { href: `${portalOrigin()}${opts.openPath}`, label: "Open review" },
    footerLine: escapeHtml(opts.projectName),
  });
  await sendBrandedTransactional({
    to: opts.to,
    subject: `Something new to review · ${opts.projectName}`,
    html,
    logTag: "client-deliverable",
  });
}

// --- Assigned team: calendar comment (feedback without revision request) ---

export async function emailNotifyAssigneesCalendarClientComment(opts: {
  recipientEmails: string[];
  projectName: string;
  projectId: string;
  calendarItemId: string;
  postLabel: string;
  commentText: string;
}): Promise<void> {
  if (opts.recipientEmails.length === 0) return;
  const href = `${portalOrigin()}/portal/project/${opts.projectId}/social/calendar?post=${encodeURIComponent(opts.calendarItemId)}`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hello,</p>`,
    bodyParagraphsHtml: [
      `The client left a comment on a social post in <strong>${escapeHtml(opts.projectName)}</strong>.`,
    ],
    detailHtml: `<p style="margin:0 0 10px;font-weight:600;">${escapeHtml(opts.postLabel.slice(0, 200))}</p><p style="margin:0;white-space:pre-wrap;">${escapeHtml(opts.commentText.slice(0, 4000))}</p>`,
    cta: { href, label: "View in calendar" },
  });
  await sendBrandedTransactional({
    to: opts.recipientEmails,
    subject: `Client comment on a post · ${opts.projectName}`,
    html,
    logTag: "calendar-client-comment",
  });
}

// --- Assigned team: client approved a review asset (proof) ---

export async function emailNotifyAssigneesReviewAssetApproved(opts: {
  recipientEmails: string[];
  projectName: string;
  projectId: string;
  assetKind: string;
}): Promise<void> {
  if (opts.recipientEmails.length === 0) return;
  const href = `${portalOrigin()}/portal/project/${opts.projectId}`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hello,</p>`,
    bodyParagraphsHtml: [
      `The client approved a proof in <strong>${escapeHtml(opts.projectName)}</strong> (${escapeHtml(opts.assetKind)}).`,
      "You can plan the next creative step or delivery from the project hub.",
    ],
    cta: { href, label: "Open project" },
  });
  await sendBrandedTransactional({
    to: opts.recipientEmails,
    subject: `Proof approved · ${opts.projectName}`,
    html,
    logTag: "review-asset-approved",
  });
}

// --- Assigned team: client message ---

export async function emailNotifyAssigneesClientMessage(opts: {
  recipientEmails: string[];
  projectName: string;
  projectId: string;
  messagePreview: string;
}): Promise<void> {
  if (opts.recipientEmails.length === 0) return;
  const href = `${portalOrigin()}/portal/project/${opts.projectId}#project-messages`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hello,</p>`,
    bodyParagraphsHtml: [`You have a new message from the client on <strong>${escapeHtml(opts.projectName)}</strong>.`],
    detailHtml: `<p style="margin:0;white-space:pre-wrap;">${escapeHtml(opts.messagePreview.slice(0, 4000))}</p>`,
    cta: { href, label: "Read thread" },
  });
  await sendBrandedTransactional({
    to: opts.recipientEmails,
    subject: `New client message · ${opts.projectName}`,
    html,
    logTag: "client-message",
  });
}

// --- Client: social post / month submitted for approval ---

export async function emailNotifyClientSocialPostSubmittedForApproval(opts: {
  to: string;
  greeting: string;
  projectName: string;
  projectId: string;
  detailHtml: string | null;
  variant: "new" | "revised" | "batch_month";
}): Promise<void> {
  const path = `/portal/project/${opts.projectId}/social/calendar`;
  const lead =
    opts.variant === "revised"
      ? "We’ve updated a post you sent feedback on — please take another look in your social calendar."
      : opts.variant === "batch_month"
        ? "Your social posts for this month are ready to review — open your calendar to approve individually or use Approve all."
        : "A new post is ready for you to review on your social calendar.";
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi ${escapeHtml(opts.greeting)},</p>`,
    bodyParagraphsHtml: [lead],
    detailHtml: opts.detailHtml,
    cta: { href: `${portalOrigin()}${path}`, label: "Open calendar" },
    footerLine: escapeHtml(opts.projectName),
  });
  const sub =
    opts.variant === "batch_month"
      ? `Your month of posts is ready · ${opts.projectName}`
      : opts.variant === "revised"
        ? `Revised post ready to review · ${opts.projectName}`
        : `Post ready for your review · ${opts.projectName}`;
  await sendBrandedTransactional({
    to: opts.to,
    subject: sub,
    html,
    logTag: "social-submitted-client",
  });
}

// --- May: client approved one social post ---

export async function emailNotifyMayClientApprovedSocialPost(opts: {
  projectName: string;
  projectId: string;
  calendarItemId: string;
  postLabel: string;
}): Promise<void> {
  const to = await emailForPersona("may");
  if (!to) return;
  const href = `${portalOrigin()}/portal/project/${opts.projectId}/social/calendar?post=${encodeURIComponent(opts.calendarItemId)}`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi May,</p>`,
    bodyParagraphsHtml: [
      `The client approved a post for <strong>${escapeHtml(opts.projectName)}</strong>. It’s cleared for scheduling.`,
    ],
    detailHtml: escapeHtml(opts.postLabel.slice(0, 300)),
    cta: { href, label: "View post" },
  });
  await sendBrandedTransactional({
    to,
    subject: `Post approved by client · ${opts.projectName}`,
    html,
    logTag: "may-post-approved",
  });
}

// --- May: client requested changes (revision) ---

export async function emailNotifyMayClientRequestedSocialChanges(opts: {
  projectName: string;
  projectId: string;
  calendarItemId: string;
  postLabel: string;
  feedbackText: string;
}): Promise<void> {
  const to = await emailForPersona("may");
  if (!to) return;
  const href = `${portalOrigin()}/portal/project/${opts.projectId}/social/calendar?post=${encodeURIComponent(opts.calendarItemId)}`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi May,</p>`,
    bodyParagraphsHtml: [
      `The client has requested changes on a post in <strong>${escapeHtml(opts.projectName)}</strong>.`,
    ],
    detailHtml: `<p style="margin:0 0 10px;font-weight:600;">${escapeHtml(opts.postLabel.slice(0, 200))}</p><p style="margin:0;white-space:pre-wrap;">${escapeHtml(opts.feedbackText.slice(0, 4000))}</p>`,
    cta: { href, label: "Open in calendar" },
  });
  await sendBrandedTransactional({
    to,
    subject: `Changes requested on a post · ${opts.projectName}`,
    html,
    logTag: "may-post-revision",
  });
}

// --- May: client approved all posts for a month ---

export async function emailNotifyMayClientApprovedAllPostsForMonth(opts: {
  projectName: string;
  projectId: string;
  monthLabel: string;
  count: number;
}): Promise<void> {
  const to = await emailForPersona("may");
  if (!to) return;
  const href = `${portalOrigin()}/portal/project/${opts.projectId}/social/calendar`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi May,</p>`,
    bodyParagraphsHtml: [
      `The client approved <strong>${opts.count}</strong> post${opts.count === 1 ? "" : "s"} for <strong>${escapeHtml(opts.monthLabel)}</strong> on <strong>${escapeHtml(opts.projectName)}</strong> in one go.`,
      "Everything in that batch is cleared for scheduling from the client’s side.",
    ],
    cta: { href, label: "View calendar" },
  });
  await sendBrandedTransactional({
    to,
    subject: `Month approved by client · ${opts.projectName}`,
    html,
    logTag: "may-month-approved",
  });
}

// --- Team: @mention in internal chat ---

export async function emailNotifyTeamMemberTaggedInChat(opts: {
  to: string;
  authorDisplay: string;
  messageBody: string;
}): Promise<void> {
  const href = `${portalOrigin()}/portal#studio-team-chat`;
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hello,</p>`,
    bodyParagraphsHtml: [
      `<strong>${escapeHtml(opts.authorDisplay)}</strong> mentioned you in <strong>internal team chat</strong> (not the client thread).`,
    ],
    detailHtml: `<p style="margin:0;white-space:pre-wrap;">${escapeHtml(opts.messageBody.slice(0, 8000))}</p>`,
    cta: { href, label: "Open team chat" },
    footerLine: "Collectiv. Studio · Agency portal",
  });
  await sendBrandedTransactional({
    to: opts.to,
    subject: `${opts.authorDisplay} mentioned you in team chat`,
    html,
    logTag: "team-mention",
  });
}

// --- Password reset (portal-client-email) ---

export async function emailNotifyPortalPasswordReset(opts: { to: string; resetUrl: string }): Promise<void> {
  const html = collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi,</p>`,
    bodyParagraphsHtml: [
      "We received a request to reset the password for your Collectiv. Studio client portal. Use the button below — the link expires in one hour.",
      "If you didn’t ask for this, you can ignore this email.",
    ],
    cta: { href: opts.resetUrl, label: "Reset password" },
  });
  await sendBrandedTransactional({
    to: opts.to,
    subject: "Reset your Collectiv. portal password",
    html,
    logTag: "password-reset",
  });
}

// --- Resolve Issy emails (contract signed), mirrors studio-inbox-notify ---

export async function resolveIssyContractNotificationEmails(): Promise<string[]> {
  const issyMembers = await prisma.studioTeamMember.findMany({
    where: { personaSlug: "isabella" },
    select: { userId: true },
  });
  const ids = issyMembers.map((m) => m.userId);
  const fromUsers = await emailsForUserIds(ids);
  const explicitTo = process.env.STUDIO_NOTIFICATION_EMAIL?.trim().toLowerCase();
  const fallbackTo = Array.from(studioEmailSet())[0]?.toLowerCase();
  const extra = explicitTo || fallbackTo;
  const set = new Set(fromUsers);
  if (extra) set.add(extra);
  return Array.from(set);
}

// --- Resolve emails for review-asset sign-off (assignee-first, else persona pool) ---

export async function resolveRecipientEmailsForReviewAssetSignoff(
  projectId: string,
  assetKind: string,
): Promise<string[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { assignedStudioUserId: true },
  });
  const team = await prisma.studioTeamMember.findMany({
    select: { userId: true, personaSlug: true },
  });
  const ids: string[] = [];
  if (project?.assignedStudioUserId) {
    ids.push(project.assignedStudioUserId);
  } else {
    const k = assetKind.toUpperCase();
    if (k === "BRANDING" || k === "SIGNAGE") {
      const h = team.find((t) => t.personaSlug === "harriet");
      if (h) ids.push(h.userId);
    }
    const i = team.find((t) => t.personaSlug === "isabella");
    if (i) ids.push(i.userId);
  }
  return emailsForUserIds(ids);
}

export { emailsForUserIds };
