import { prisma } from "@/lib/prisma";
import { createClientInAppNotificationForProject } from "@/lib/client-in-app-notify";
import { labelForChannel, parseCalendarChannelsJson } from "@/lib/calendar-channels";
import { formatContentCalendarWhen } from "@/lib/format-content-calendar-when";
import { normalizePortalKind, visiblePortalSections } from "@/lib/portal-project-kind";
import { isStudioEmailAddress } from "@/lib/portal-studio-users";
import { getResendConfig, sendResendEmail } from "@/lib/resend-email";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clientEmailAlertsEnabled(): boolean {
  const v = process.env.PORTAL_CLIENT_EMAIL_ALERTS?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off") return false;
  return true;
}

export function getPortalPublicOrigin(): string {
  const raw = process.env.NEXTAUTH_URL?.trim() || "http://127.0.0.1:3333";
  return raw.replace(/\/$/, "");
}

async function resolveRecipient(projectId: string): Promise<{
  email: string;
  greeting: string;
  projectName: string;
  hasRegistered: boolean;
  portalKind: string;
} | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { user: { select: { email: true, name: true, businessName: true, passwordHash: true } } },
  });
  if (!project) return null;

  const email =
    project.user?.email?.trim().toLowerCase() ||
    project.invitedClientEmail?.trim().toLowerCase() ||
    null;
  if (!email || isStudioEmailAddress(email)) return null;

  const first =
    project.user?.name?.trim().split(/\s+/)[0] ||
    project.user?.businessName?.trim() ||
    null;
  const greeting = first ? escapeHtml(first) : "there";

  return {
    email,
    greeting,
    projectName: project.name,
    hasRegistered: Boolean(project.userId && project.user?.passwordHash),
    portalKind: project.portalKind,
  };
}

function emailShell(opts: {
  greeting: string;
  projectName: string;
  lead: string;
  detail?: string | null;
  ctaUrl: string;
  ctaLabel: string;
}): string {
  const detailBlock = opts.detail
    ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#3d2a2f;">${opts.detail}</p>`
    : "";
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#f7f4f2;color:#250d18;padding:24px;">
<p style="margin:0 0 12px;font-size:15px;">Hi ${opts.greeting},</p>
<p style="margin:0;font-size:15px;line-height:1.55;color:#3d2a2f;">${opts.lead}</p>
${detailBlock}
<p style="margin:28px 0 0;"><a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;padding:12px 20px;background:#250d18;color:#f7f4f2;text-decoration:none;font-size:14px;border-radius:4px;">${escapeHtml(
    opts.ctaLabel,
  )}</a></p>
<p style="margin:28px 0 0;font-size:13px;color:#6b5a5e;">— Collectiv. Studio</p>
<p style="margin:8px 0 0;font-size:12px;color:#8a787c;">${escapeHtml(opts.projectName)}</p>
</body></html>`;
}

async function deliverClientEmail(to: string, subject: string, html: string): Promise<void> {
  if (!clientEmailAlertsEnabled()) return;

  const hasResend = Boolean(getResendConfig());
  if (!hasResend) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[portal] Client email alert (set RESEND_API_KEY to send):", { to, subject });
    }
    return;
  }

  await sendResendEmail({ to, subject, html });
}

function buildMail(projectId: string, path: string, fields: Omit<Parameters<typeof emailShell>[0], "ctaUrl">) {
  const ctaUrl = `${getPortalPublicOrigin()}${path}`;
  return emailShell({ ...fields, ctaUrl });
}

function platformsLineFromChannelsJson(channelsJson: string): string {
  return parseCalendarChannelsJson(channelsJson)
    .map((id) => labelForChannel(id))
    .join(", ");
}

export type ClientCalendarNotifyVariant = "new" | "revised" | "batch_month";

/** Client: post (or full month) ready to review — includes schedule + platforms in-app and email. */
export async function notifyClientCalendarPostReadyForReview(
  projectId: string,
  opts: {
    postLabel: string;
    scheduledIso: string | null;
    channelsJson: string;
    variant: ClientCalendarNotifyVariant;
  },
): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const when = formatContentCalendarWhen(opts.scheduledIso, { withTime: true });
  const plats = platformsLineFromChannelsJson(opts.channelsJson);
  const title =
    opts.variant === "revised"
      ? "Revised post ready to review"
      : opts.variant === "batch_month"
        ? "Your month of posts is ready"
        : "Post ready for your review";
  const bodyLine =
    opts.variant === "batch_month"
      ? `${opts.postLabel} — open your calendar to review or approve all.`.slice(0, 500)
      : `${when} · ${plats}`.slice(0, 500);
  const subject = `Collectiv. Studio — ${title.toLowerCase()} · ${r.projectName}`;
  const detail =
    opts.variant === "batch_month"
      ? `<strong>${escapeHtml(opts.postLabel.slice(0, 200))}</strong><br/><span style="font-size:14px;line-height:1.5;color:#5c4a4e;">Every post for this month is ready — review individually or use Approve all.</span>`
      : `<strong>${escapeHtml(opts.postLabel.slice(0, 200))}</strong><br/><span style="font-size:14px;line-height:1.5;color:#5c4a4e;">${escapeHtml(when)} · ${escapeHtml(plats)}</span>`;
  const html = buildMail(projectId, `/portal/project/${projectId}/social/calendar`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead:
      opts.variant === "revised"
        ? "We’ve updated a post you sent feedback on — open your calendar to review the revised version."
        : opts.variant === "batch_month"
          ? "Your social posts for this month are ready to review in one go — open your calendar to approve individually or use Approve all."
          : "A new post is ready for you to review on your social calendar.",
    detail,
    ctaLabel: "Open calendar",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: opts.variant === "batch_month" ? "SOCIAL_MONTH_BATCH_REVIEW" : "CALENDAR_POST",
    title,
    body: `${opts.postLabel.slice(0, 120)} — ${bodyLine}`.slice(0, 500),
    href: `/portal/project/${projectId}/social/calendar`,
  });
}

/** @deprecated Use notifyClientCalendarPostReadyForReview — kept for call sites passing label only. */
export async function notifyClientCalendarContentAdded(
  projectId: string,
  postLabel: string | null,
  meta?: { scheduledIso?: string | null; channelsJson?: string },
): Promise<void> {
  await notifyClientCalendarPostReadyForReview(projectId, {
    postLabel: postLabel?.trim() || "New post",
    scheduledIso: meta?.scheduledIso ?? null,
    channelsJson: meta?.channelsJson ?? '["instagram"]',
    variant: "new",
  });
}

export async function notifyClientCalendarPostRemoved(
  projectId: string,
  postLabel: string,
  scheduledIso: string | null,
  channelsJson: string,
): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const when = formatContentCalendarWhen(scheduledIso, { withTime: true });
  const plats = platformsLineFromChannelsJson(channelsJson);
  const subject = `Collectiv. Studio — post removed from your calendar · ${r.projectName}`;
  const detail = `<strong>${escapeHtml(postLabel.slice(0, 200))}</strong><br/><span style="font-size:14px;color:#5c4a4e;">Was scheduled: ${escapeHtml(when)} · ${escapeHtml(plats)}</span>`;
  const html = buildMail(projectId, `/portal/project/${projectId}/social/calendar`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead: "The studio removed a post from your content calendar. Open the calendar to see your current schedule.",
    detail,
    ctaLabel: "View calendar",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "CALENDAR_POST_REMOVED",
    title: "A scheduled post was removed",
    body: `${postLabel.slice(0, 100)} — ${when}`.slice(0, 500),
    href: `/portal/project/${projectId}/social/calendar`,
  });
}

/** Review file uploaded for branding / signage / general. */
function sharedDeliverableReviewPath(projectId: string, portalKind: string): string {
  const k = normalizePortalKind(portalKind);
  const vis = visiblePortalSections(portalKind);
  if (k === "BRANDING") return `/portal/project/${projectId}/branding/final-files`;
  if (k === "PRINT") return `/portal/project/${projectId}/print/proofs`;
  if (k === "SIGNAGE") return `/portal/project/${projectId}/signage/final-files#signage-shared-files`;
  if (vis.branding) return `/portal/project/${projectId}/branding/final-files`;
  if (vis.signage) return `/portal/project/${projectId}/signage/final-files#signage-shared-files`;
  return `/portal/project/${projectId}`;
}

export async function notifyClientReviewAssetAdded(
  projectId: string,
  kind: string,
  assetTitle: string,
): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const k = kind.toUpperCase();
  const path =
    k === "SIGNAGE"
      ? `/portal/project/${projectId}/signage`
      : k === "BRANDING"
        ? `/portal/project/${projectId}/branding`
        : sharedDeliverableReviewPath(projectId, r.portalKind);
  const subject = `Collectiv. Studio — something new to review · ${r.projectName}`;
  const html = buildMail(projectId, path, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead: "We’ve uploaded a new file for you to review in your portal.",
    detail: escapeHtml(assetTitle.slice(0, 200)),
    ctaLabel: "Open review",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "REVIEW_ASSET",
    title: "Something new to review",
    body: assetTitle.slice(0, 200),
    href: path,
  });
}

/** Studio posted in project messages. */
export async function notifyClientStudioMessage(projectId: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const subject = `Collectiv. Studio — new message · ${r.projectName}`;
  const html = buildMail(projectId, `/portal/project/${projectId}`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead: "You have a new message from the studio in your project portal.",
    ctaLabel: "Read message",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "STUDIO_MESSAGE",
    title: "New message from the studio",
    body: "",
    href: `/portal/project/${projectId}#project-messages`,
  });
}

/** Quote marked as sent. */
export async function notifyClientQuoteSent(projectId: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const subject = `Collectiv. Studio — your quote is ready · ${r.projectName}`;
  const html = buildMail(projectId, `/portal/project/${projectId}`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead: "Your project quote is ready to view in the portal.",
    ctaLabel: "View quote",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "QUOTE",
    title: "Your quote is ready",
    body: "",
    href: `/portal/project/${projectId}`,
  });
}

/** Studio verified the client account. */
export async function notifyClientAccountVerified(projectId: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r || !r.hasRegistered) return;
  const subject = `Collectiv. Studio — your portal is unlocked · ${r.projectName}`;
  const html = buildMail(projectId, `/portal/project/${projectId}`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead: "Your account is verified. You can now use the full client portal for this project — briefs, files, calendar, and messages.",
    ctaLabel: "Open project",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "PORTAL_UNLOCKED",
    title: "Your portal is unlocked",
    body: "",
    href: `/portal/project/${projectId}`,
  });
}

/** Website discovery approved — client can progress on website kit. */
export async function notifyClientDiscoveryApproved(projectId: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const subject = `Collectiv. Studio — you’re cleared for the next step · ${r.projectName}`;
  const html = buildMail(projectId, `/portal/project/${projectId}/website`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead: "Discovery is approved. You can continue with your website kit and next steps in the portal.",
    ctaLabel: "Continue website kit",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "DISCOVERY",
    title: "You’re cleared for the next step",
    body: "",
    href: `/portal/project/${projectId}/website`,
  });
}

/** Live site URL recorded. */
export async function notifyClientWebsiteLive(projectId: string, liveUrl: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const subject = `Collectiv. Studio — your site is live · ${r.projectName}`;
  const html = buildMail(projectId, `/portal/project/${projectId}/website`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead: "Your live website link has been added to the portal.",
    detail: `<a href="${escapeHtml(liveUrl)}" style="color:#250d18;">${escapeHtml(liveUrl)}</a>`,
    ctaLabel: "Open portal",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "WEBSITE_LIVE",
    title: "Your site is live",
    body: liveUrl.slice(0, 200),
    href: `/portal/project/${projectId}/website`,
  });
}

/** Studio marked project complete (offboarding flow). */
export async function notifyClientProjectWrappedUp(projectId: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r || !r.hasRegistered) return;
  const subject = `Collectiv. Studio — project complete · ${r.projectName}`;
  const html = buildMail(projectId, `/portal/project/${projectId}`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead: "We’ve marked this project as complete in the portal. You’ll find any final wrap-up steps there — including the option to leave a review when you’re ready.",
    ctaLabel: "Open portal",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "WRAP_UP",
    title: "Project marked complete",
    body: "",
    href: `/portal/project/${projectId}`,
  });
}

/** New project created for this client (registered or invite). */
export async function notifyClientNewProject(projectId: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const subject = `Collectiv. Studio — new project · ${r.projectName}`;
  const lead = r.hasRegistered
    ? "A new project has been added to your Collectiv portal. Open it any time to see briefs, content, and updates."
    : "You’ve been invited to a Collectiv. Studio project. Create your portal account with this email address to view everything in one place.";
  const html = buildMail(projectId, `/portal`, {
    greeting: r.greeting,
    projectName: r.projectName,
    lead,
    ctaLabel: r.hasRegistered ? "Open portal" : "Sign in or register",
  });
  await deliverClientEmail(r.email, subject, html);
  if (r.hasRegistered) {
    await createClientInAppNotificationForProject(projectId, {
      kind: "NEW_PROJECT",
      title: `New project: ${r.projectName}`,
      body: "",
      href: `/portal/project/${projectId}`,
    });
  }
}

/**
 * Password reset — always attempts send when Resend is configured (not gated by PORTAL_CLIENT_EMAIL_ALERTS).
 */
export async function sendPortalPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const safeUrl = escapeHtml(resetUrl);
  const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#f7f4f2;color:#250d18;padding:24px;">
<p style="margin:0 0 12px;font-size:15px;">Hi,</p>
<p style="margin:0;font-size:15px;line-height:1.55;color:#3d2a2f;">We received a request to reset the password for your Collectiv. Studio client portal. Use the button below — it expires in one hour.</p>
<p style="margin:28px 0 0;"><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#250d18;color:#f7f4f2;text-decoration:none;font-size:14px;border-radius:4px;">Reset password</a></p>
<p style="margin:20px 0 0;font-size:13px;color:#6b5a5e;">If you didn’t ask for this, you can ignore this email.</p>
<p style="margin:28px 0 0;font-size:13px;color:#6b5a5e;">— Collectiv. Studio</p>
</body></html>`;

  const cfg = getResendConfig();
  if (cfg) {
    await sendResendEmail({
      to,
      subject: "Reset your Collectiv. portal password",
      html,
    });
    return;
  }
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[portal] Password reset (set RESEND_API_KEY to send email):", { to, resetUrl });
  }
}

/**
 * Invite email for clients who have not set a password yet — always attempts send when Resend is configured
 * (same as password reset), not gated by PORTAL_CLIENT_EMAIL_ALERTS.
 */
export async function sendClientPortalInviteEmail(opts: {
  to: string;
  firstName: string;
  registerUrl: string;
}): Promise<void> {
  const first = opts.firstName.trim() || "there";
  const safeName = escapeHtml(first);
  const safeUrl = escapeHtml(opts.registerUrl);
  const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#f7f4f2;color:#250d18;padding:24px;line-height:1.55;">
<p style="margin:0 0 12px;font-size:15px;">Hi ${safeName},</p>
<p style="margin:0;font-size:15px;color:#3d2a2f;">You’ve been invited to the <strong>Collectiv. Studio client portal</strong> — a calm place to follow your project, review files, and message our team in one thread.</p>
<p style="margin:16px 0 0;font-size:15px;color:#3d2a2f;">Tap below to set your password and open your hub. This link is personal to you.</p>
<p style="margin:28px 0 0;"><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#250d18;color:#f7f4f2;text-decoration:none;font-size:14px;border-radius:4px;font-weight:600;">Set up your account</a></p>
<p style="margin:28px 0 0;font-size:13px;color:#6b5a5e;">Warmly,<br/>Collectiv. Studio</p>
</body></html>`;

  const cfg = getResendConfig();
  if (cfg) {
    await sendResendEmail({
      to: opts.to.trim().toLowerCase(),
      subject: "You have been invited to the Collectiv. Studio client portal",
      html,
    });
    return;
  }
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[portal] Client invite (set RESEND_API_KEY to send):", { to: opts.to, registerUrl: opts.registerUrl });
  }
}
