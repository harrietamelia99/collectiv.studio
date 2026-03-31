import { prisma } from "@/lib/prisma";
import { createClientInAppNotificationForProject } from "@/lib/client-in-app-notify";
import { labelForChannel, parseCalendarChannelsJson } from "@/lib/calendar-channels";
import { formatContentCalendarWhen } from "@/lib/format-content-calendar-when";
import { normalizePortalKind, visiblePortalSections } from "@/lib/portal-project-kind";
import { workspaceUnlockNextStepParagraph } from "@/lib/portal-workspace-unlock-copy";
import { isStudioEmailAddress } from "@/lib/portal-studio-users";
import {
  collectivEmailShell,
  emailNotifyClientInvitedToPortal,
  emailNotifyClientSocialPostSubmittedForApproval,
  emailNotifyPortalPasswordReset,
  escapeHtml,
  sendBrandedTransactional,
} from "@/lib/email-notifications";

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
  /** HTML-safe first name (or "there") for templates. */
  greeting: string;
  /** Plain display name for APIs that escape internally. */
  greetingPlain: string;
  projectName: string;
  hasRegistered: boolean;
  portalKind: string;
} | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          businessName: true,
          passwordHash: true,
          studioTeamProfile: { select: { id: true } },
        },
      },
    },
  });
  if (!project) return null;

  const email =
    project.user?.email?.trim().toLowerCase() ||
    project.invitedClientEmail?.trim().toLowerCase() ||
    null;
  if (!email || isStudioEmailAddress(email) || project.user?.studioTeamProfile) return null;

  const first =
    project.user?.name?.trim().split(/\s+/)[0] ||
    project.user?.businessName?.trim() ||
    null;
  const greetingPlain = first || "there";
  const greeting = escapeHtml(greetingPlain);

  return {
    email,
    greeting,
    greetingPlain,
    projectName: project.name,
    hasRegistered: Boolean(project.userId && project.user?.passwordHash),
    portalKind: project.portalKind,
  };
}

function buildClientAlertHtml(opts: {
  greetingSafe: string;
  paragraphs: string[];
  detailHtml?: string | null;
  ctaPath: string;
  ctaLabel: string;
  footerLine?: string | null;
}): string {
  return collectivEmailShell({
    greetingHtml: `<p style="margin:0 0 16px;font-size:15px;">Hi ${opts.greetingSafe},</p>`,
    bodyParagraphsHtml: opts.paragraphs,
    detailHtml: opts.detailHtml ?? undefined,
    cta: { href: `${getPortalPublicOrigin()}${opts.ctaPath}`, label: opts.ctaLabel },
    footerLine: opts.footerLine ? escapeHtml(opts.footerLine) : undefined,
  });
}

async function deliverClientEmail(to: string, subject: string, html: string): Promise<void> {
  if (!clientEmailAlertsEnabled()) return;
  await sendBrandedTransactional({ to, subject, html, logTag: "client-alert" });
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
  const detailHtml =
    opts.variant === "batch_month"
      ? `<p style="margin:0 0 8px;font-weight:600;">${escapeHtml(opts.postLabel.slice(0, 200))}</p><p style="margin:0;font-size:14px;line-height:1.5;color:#5c4a4e;">Every post for this month is ready — review individually or use Approve all.</p>`
      : `<p style="margin:0 0 8px;font-weight:600;">${escapeHtml(opts.postLabel.slice(0, 200))}</p><p style="margin:0;font-size:14px;line-height:1.5;color:#5c4a4e;">${escapeHtml(when)} · ${escapeHtml(plats)}</p>`;
  if (clientEmailAlertsEnabled()) {
    await emailNotifyClientSocialPostSubmittedForApproval({
      to: r.email,
      greeting: r.greetingPlain,
      projectName: r.projectName,
      projectId,
      detailHtml,
      variant: opts.variant,
    });
  }
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
  const detail = `<p style="margin:0 0 8px;font-weight:600;">${escapeHtml(postLabel.slice(0, 200))}</p><p style="margin:0;font-size:14px;color:#5c4a4e;">Was scheduled: ${escapeHtml(when)} · ${escapeHtml(plats)}</p>`;
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [
      escapeHtml(
        "The studio removed a post from your content calendar. Open the calendar to see your current schedule.",
      ),
    ],
    detailHtml: detail,
    ctaPath: `/portal/project/${projectId}/social/calendar`,
    ctaLabel: "View calendar",
    footerLine: r.projectName,
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
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [escapeHtml("We’ve uploaded a new file for you to review in your portal.")],
    detailHtml: `<p style="margin:0;">${escapeHtml(assetTitle.slice(0, 200))}</p>`,
    ctaPath: path,
    ctaLabel: "Open review",
    footerLine: r.projectName,
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
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [escapeHtml("You have a new message from the studio in your project portal.")],
    ctaPath: `/portal/project/${projectId}`,
    ctaLabel: "Read message",
    footerLine: r.projectName,
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
  const subject = "Your quote from Collectiv. Studio is ready";
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [
      escapeHtml(
        "We’ve prepared your quote for this project — everything you need is on your project page in the client portal.",
      ),
      escapeHtml(
        "Open the link below when you’re ready to review the line items and next steps. If anything is unclear, reply from your project thread and we’ll help.",
      ),
    ],
    ctaPath: `/portal/project/${projectId}`,
    ctaLabel: "View your project & quote",
    footerLine: r.projectName,
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "QUOTE",
    title: "Your quote is ready",
    body: "",
    href: `/portal/project/${projectId}`,
  });
}

/** Issy unlocked full workspace — email + in-app notification. */
export async function notifyClientWorkspaceUnlocked(projectId: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r) return;
  const next = workspaceUnlockNextStepParagraph(r.portalKind);
  const subject = `Your ${r.projectName} workspace is now open`;
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [
      escapeHtml(
        "Great news — your quote and agreement are all sorted. Your project workspace is now open and ready for you.",
      ),
      escapeHtml(next),
    ],
    ctaPath: `/portal/project/${projectId}`,
    ctaLabel: "Open my workspace",
    footerLine: "Signed off as Collectiv. Studio",
  });
  await deliverClientEmail(r.email, subject, html);
  await createClientInAppNotificationForProject(projectId, {
    kind: "WORKSPACE_UNLOCKED",
    title: "Your workspace is open",
    body: "Your workspace is open - see what's next inside your project.",
    href: `/portal/project/${projectId}`,
  });
}

/** Studio verified the client account. */
export async function notifyClientAccountVerified(projectId: string): Promise<void> {
  const r = await resolveRecipient(projectId);
  if (!r || !r.hasRegistered) return;
  const subject = `Collectiv. Studio — your portal is unlocked · ${r.projectName}`;
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [
      escapeHtml(
        "Your account is verified. You can now use the full client portal for this project — briefs, files, calendar, and messages.",
      ),
    ],
    ctaPath: `/portal/project/${projectId}`,
    ctaLabel: "Open project",
    footerLine: r.projectName,
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
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [
      escapeHtml(
        "Discovery is approved. You can continue with your website kit and next steps in the portal.",
      ),
    ],
    ctaPath: `/portal/project/${projectId}/website`,
    ctaLabel: "Continue website kit",
    footerLine: r.projectName,
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
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [escapeHtml("Your live website link has been added to the portal.")],
    detailHtml: `<p style="margin:0;"><a href="${escapeHtml(liveUrl)}" style="color:#250d18;">${escapeHtml(liveUrl)}</a></p>`,
    ctaPath: `/portal/project/${projectId}/website`,
    ctaLabel: "Open portal",
    footerLine: r.projectName,
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
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [
      escapeHtml(
        "We’ve marked this project as complete in the portal. You’ll find any final wrap-up steps there — including the option to leave a review when you’re ready.",
      ),
    ],
    ctaPath: `/portal/project/${projectId}`,
    ctaLabel: "Open portal",
    footerLine: r.projectName,
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
  const html = buildClientAlertHtml({
    greetingSafe: r.greeting,
    paragraphs: [escapeHtml(lead)],
    ctaPath: `/portal`,
    ctaLabel: r.hasRegistered ? "Open portal" : "Sign in or register",
    footerLine: r.projectName,
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
  await emailNotifyPortalPasswordReset({ to: to.trim().toLowerCase(), resetUrl });
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
  await emailNotifyClientInvitedToPortal({
    to: opts.to.trim().toLowerCase(),
    firstName: opts.firstName,
    registerUrl: opts.registerUrl,
  });
}
