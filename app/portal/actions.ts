"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { MAX_STORED_ASSET_URL_OR_PATH_LEN } from "@/lib/portal-asset-constants";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isStudioUser, studioMayAccessProjectSocialCalendar } from "@/lib/portal-access";
import { sessionStudioPersonaIsIssy } from "@/lib/studio-issy-guard";
import {
  sendPortalPasswordResetEmail,
  getPortalPublicOrigin,
  sendClientPortalInviteEmail,
} from "@/lib/portal-client-email";
import { normalizePhoneForStorage, portalClientPasswordOk, registrationPhoneOk } from "@/lib/portal-registration";
import { notifyStudioClientRegistered } from "@/lib/portal-notify";
import {
  formatPortalUploadFailureForUser,
  rethrowPortalUploadAction,
  saveFontUpload,
  saveProjectUpload,
  socialCalendarUploadMediaKind,
  validateUploadExtension,
} from "@/lib/portal-uploads";
import { deleteUploadThingFileByStoredValue } from "@/lib/uploadthing";
import { appendCalendarActivityLog } from "@/lib/calendar-activity-log";
import {
  notifyIssyClientSignedContractInPortal,
  notifyStudioTeamCalendarClientComment,
  notifyStudioTeamCalendarFeedback,
  notifyStudioTeamCalendarPostApproved,
  notifyStudioTeamClientMessage,
} from "@/lib/studio-inbox-notify";
import type { PortalKind } from "@/lib/portal-project-kind";
import {
  clientMayEditWebsiteBrandKitFields,
  clientMaySignOffReviewAssetKind,
  clientMayUseSocialPortal,
  clientMayUseWebsiteWorkstream,
  normalizePortalKind,
  STUDIO_FORM_WEBSITE_SOCIAL_PAIR,
  visiblePortalSections,
  websiteSocialPairProjectNames,
} from "@/lib/portal-project-kind";
import { websitePageContentHubProgressPercent } from "@/lib/portal-progress";
import { parsePageImagePaths } from "@/lib/website-kit-pages";
import { normalizeCalendarChannelsFromForm } from "@/lib/calendar-channels";
import {
  normalizeVariationKind,
  parseWebsiteLogoVariations,
} from "@/lib/website-logo-variations";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { parseQuoteLineItemsJson, quoteAllowedForProject } from "@/lib/portal-quote-lines";
import { normalizePaymentStatus } from "@/lib/portal-payment-status";
import {
  appendClientMessageTodo,
  notifyCalendarPostSignedOff,
  notifyInspirationLinksUpdated,
  notifyOffboardingReviewSubmitted,
  notifyReviewAssetSignedOff,
  notifySocialOnboardingSubmitted,
  notifyWebsiteKitSignedOff,
} from "@/lib/agency-todos";
import { syncAutoPhaseTodosForProject } from "@/lib/studio-auto-phase-todos";
import { encryptSocialAccountAccessPlaintext } from "@/lib/social-account-access-crypto";
import { parseSocialOnboardingJson } from "@/lib/social-onboarding";
import {
  decryptWebsiteDomainVaultPayload,
  encryptWebsiteDomainVaultPayload,
} from "@/lib/website-domain-access-crypto";
import {
  offboardingHighlightAnswer,
  parseOffboardingAnswersFromFormData,
} from "@/lib/portal-offboarding";
import { clientIsBlockedByPendingOffboarding } from "@/lib/portal-offboarding-gate";
import {
  emailNotifyAssigneesReviewAssetApproved,
  emailNotifyClientDepositPaidHubUnlocked,
  emailNotifyClientWelcomeAfterSelfRegistration,
  emailNotifyStudioNewClientRegistered,
  resolveRecipientEmailsForReviewAssetSignoff,
} from "@/lib/email-notifications";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { removeOldAvatarFile, saveClientAvatarFile } from "@/lib/portal-client-avatar";
import { copyUserBrandKitToNewProject, upsertUserBrandKitFromBrandingProject } from "@/lib/user-brand-kit-sync";
import {
  notifyClientAccountVerified,
  notifyClientCalendarContentAdded,
  notifyClientCalendarPostRemoved,
  notifyClientDiscoveryApproved,
  notifyClientNewProject,
  notifyClientProjectWrappedUp,
  notifyClientQuoteSent,
  notifyClientReviewAssetAdded,
  notifyClientStudioMessage,
  notifyClientWebsiteLive,
} from "@/lib/portal-client-email";
import {
  parseBrandQuestionnaireJson,
  stringifyBrandQuestionnaire,
  validateBrandQuestionnaireForSubmit,
} from "@/lib/brand-questionnaire";
import { normalizeWebsiteHexInput } from "@/lib/website-brand-hex";
import { type PortalFormFlash, portalFlashErr, portalFlashOk } from "@/lib/portal-form-flash";
import {
  BRANDING_STEP_SLUGS,
  clientInspirationStepSatisfied,
  PRINT_STEP_SLUGS,
  SIGNAGE_STEP_SLUGS,
} from "@/lib/portal-workflow";
import { notifyStudioBrandingQuestionnaireSubmitted, notifyStudioWorkflowStepCompletedByClient } from "@/lib/portal-workflow-notify";
import {
  isStepReopenedForClient,
  parseWorkflowReopenJson,
  stringifyWorkflowReopenJson,
} from "@/lib/portal-workflow-reopen";

function parseFontPaths(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim().slice(0, MAX_STORED_ASSET_URL_OR_PATH_LEN))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function revalidateProject(projectId: string) {
  revalidatePath("/portal");
  revalidatePath(`/portal/project/${projectId}`);
  revalidatePath(`/portal/project/${projectId}/social`);
  revalidatePath(`/portal/project/${projectId}/social/planning`);
  revalidatePath(`/portal/project/${projectId}/social/calendar`);
  revalidatePath(`/portal/project/${projectId}/website`);
  revalidatePath(`/portal/project/${projectId}/website/kit`);
  revalidatePath(`/portal/project/${projectId}/website/brand-kit`);
  revalidatePath(`/portal/project/${projectId}/website/content`);
  revalidatePath(`/portal/project/${projectId}/website/preview`);
  revalidatePath(`/portal/project/${projectId}/website/domain`);
  revalidatePath(`/portal/project/${projectId}/branding`);
  for (const s of BRANDING_STEP_SLUGS) {
    revalidatePath(`/portal/project/${projectId}/branding/${s}`);
  }
  revalidatePath(`/portal/project/${projectId}/branding/review`);
  revalidatePath(`/portal/project/${projectId}/branding/downloads`);
  revalidatePath(`/portal/project/${projectId}/signage`);
  for (const s of SIGNAGE_STEP_SLUGS) {
    revalidatePath(`/portal/project/${projectId}/signage/${s}`);
  }
  revalidatePath(`/portal/project/${projectId}/deliverables`);
  revalidatePath(`/portal/project/${projectId}/print`);
  for (const s of PRINT_STEP_SLUGS) {
    revalidatePath(`/portal/project/${projectId}/print/${s}`);
  }
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { websiteKitPreviewToken: true },
  });
  if (p?.websiteKitPreviewToken) {
    revalidatePath(`/preview/website-kit/${p.websiteKitPreviewToken}`);
  }
  await syncAutoPhaseTodosForProject(projectId);
  const { triggerProjectCalendarRefresh } = await import("@/lib/calendar-realtime");
  void triggerProjectCalendarRefresh(projectId);
}

function newWebsiteKitPreviewToken(): string {
  return randomBytes(24).toString("hex");
}

async function ensureWebsitePageBriefRecords(projectId: string, count: number) {
  for (let i = 0; i < count; i++) {
    await prisma.websitePageBrief.upsert({
      where: { projectId_pageIndex: { projectId, pageIndex: i } },
      create: { projectId, pageIndex: i },
      update: {},
    });
  }
}

function canManageWebsiteSitemap(session: Session | null, project: { userId: string | null }): boolean {
  if (!session?.user?.id) return false;
  if (isStudioUser(session.user.email)) return true;
  return project.userId === session.user.id;
}

/** Client can upload HEX / fonts / logo after studio verification, or anytime after website discovery is approved. */
function canClientUseBrandKitUploads(project: {
  discoveryApprovedAt: Date | null;
  portalKind: string;
  clientVerifiedAt: Date | null;
  clientContractSignedAt: Date | null;
  studioDepositMarkedPaidAt: Date | null;
}): boolean {
  if (!clientHasFullPortalAccess(project)) return false;
  if (project.discoveryApprovedAt) return true;
  return project.portalKind === "SOCIAL";
}

function registrationEmailOk(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

export async function registerUser(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim() || null;
  if (!email || !password || !portalClientPasswordOk(password)) {
    return {
      error: "Use a valid email and a password of at least 8 characters including at least one number.",
    };
  }
  if (!registrationEmailOk(email)) {
    return { error: "Use a valid email address." };
  }
  if (!firstName || !lastName) {
    return { error: "Please enter your first and last name." };
  }
  if (!registrationPhoneOk(phoneRaw)) {
    return {
      error:
        "Enter a valid phone number (at least 8 digits; you can include spaces, brackets, or a leading + for country code).",
    };
  }
  const phone = normalizePhoneForStorage(phoneRaw);
  const fullName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  if (existing && !existing.passwordHash) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        firstName,
        lastName,
        phone,
        name: fullName || null,
        businessName,
        clientInviteToken: null,
        clientInviteExpiresAt: null,
        clientRegisteredAt: new Date(),
      },
    });
    await prisma.project.updateMany({
      where: { invitedClientEmail: email, userId: null },
      data: { userId: existing.id, invitedClientEmail: null },
    });
    await notifyStudioClientRegistered({ email, name: fullName || null, phone });
    await emailNotifyStudioNewClientRegistered({
      clientEmail: email,
      clientName: fullName || null,
      clientPhone: phone,
    });
    /** Welcome email: `to` is the client’s registered (normalised) address from the form. */
    await emailNotifyClientWelcomeAfterSelfRegistration({ to: email, firstName });
    redirect("/portal/register/success");
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      name: fullName || null,
      businessName,
      clientRegisteredAt: new Date(),
    },
  });
  await prisma.project.updateMany({
    where: { invitedClientEmail: email, userId: null },
    data: { userId: newUser.id, invitedClientEmail: null },
  });
  await notifyStudioClientRegistered({ email, name: fullName || null, phone });
  await emailNotifyStudioNewClientRegistered({
    clientEmail: email,
    clientName: fullName || null,
    clientPhone: phone,
  });
  /** Welcome email: `to` is the client’s registered (normalised) address from the form. */
  await emailNotifyClientWelcomeAfterSelfRegistration({ to: email, firstName });
  redirect("/portal/register/success");
}

export async function completeClientInviteRegistration(
  _prev: { error?: string; ok?: boolean; email?: string } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean; email?: string }> {
  const token = String(formData.get("token") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: "This link is missing a token. Open the link from your email again." };
  }
  if (!fullName || fullName.length > 200) {
    return { error: "Please enter your full name." };
  }
  if (!portalClientPasswordOk(password)) {
    return { error: "Password must be at least 8 characters and include at least one number." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const user = await prisma.user.findFirst({
    where: { clientInviteToken: token },
  });
  if (!user || user.passwordHash) {
    return { error: "This invite link is no longer valid." };
  }
  if (!user.clientInviteExpiresAt || user.clientInviteExpiresAt < new Date()) {
    return {
      error:
        "This invite link has expired. Please contact the studio and we’ll send you a fresh link.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? fullName;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      name: fullName,
      firstName,
      lastName: lastName || null,
      clientInviteToken: null,
      clientInviteExpiresAt: null,
      clientRegisteredAt: new Date(),
    },
  });

  await prisma.project.updateMany({
    where: { invitedClientEmail: user.email, userId: null },
    data: { userId: user.id, invitedClientEmail: null },
  });

  await notifyStudioClientRegistered({
    email: user.email,
    name: fullName,
    phone: user.phone ?? null,
  });

  return { ok: true, email: user.email };
}

export async function requestPasswordReset(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    return { error: "Enter the email you use for the portal." };
  }
  if (!registrationEmailOk(email)) {
    return { ok: true };
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiresAt: expires,
      },
    });
    const resetUrl = `${getPortalPublicOrigin()}/portal/reset-password?token=${encodeURIComponent(token)}`;
    await sendPortalPasswordResetEmail(email, resetUrl);
  }
  return { ok: true };
}

export async function resetPasswordWithToken(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!token) {
    return { error: "This reset link is missing a token. Open the link from your email again." };
  }
  if (password.length < 8) {
    return { error: "Use a password of at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token },
  });
  if (!user?.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one from the sign-in page." };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
    },
  });
  redirect("/portal/login?reset=1");
}

async function resolveAssignedStudioUserIdForCreate(
  formData: FormData,
): Promise<{ id: string | null } | { error: string }> {
  const raw = String(formData.get("assignedStudioUserId") ?? "").trim();
  if (!raw) return { id: null };
  const u = await prisma.user.findUnique({ where: { id: raw }, select: { email: true } });
  if (!u || !isStudioUser(u.email)) {
    return { error: "Pick a valid studio admin from the assignee list, or leave it unassigned." };
  }
  return { id: raw };
}

export async function createStudioProject(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email)) {
    return { error: "You don’t have permission to create projects." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const rawPortalKind = String(formData.get("portalKind") ?? "WEBSITE").trim();
  const isWebsiteSocialPair = rawPortalKind === STUDIO_FORM_WEBSITE_SOCIAL_PAIR;
  const portalKind = isWebsiteSocialPair ? null : normalizePortalKind(rawPortalKind);
  if (portalKind === "ONE_OFF") {
    return {
      error:
        "Combined branding + signage in one project is retired. Create a Branding project and a Signage project instead.",
    };
  }

  const creatorMember = session.user.id
    ? await prisma.studioTeamMember.findUnique({
        where: { userId: session.user.id },
        select: { personaSlug: true },
      })
    : null;
  if (creatorMember?.personaSlug === "may") {
    if (isWebsiteSocialPair || portalKind !== "SOCIAL") {
      return {
        error: "You can only create social media management subscriptions (single “Social media management” project).",
      };
    }
  }
  const mode = String(formData.get("assignmentMode") ?? "existing");

  if (!name || name.length > 200) {
    return { error: "Enter a project name (max 200 characters)." };
  }

  const assigneeRes = await resolveAssignedStudioUserIdForCreate(formData);
  if ("error" in assigneeRes) return assigneeRes;
  const assignedStudioUserId = assigneeRes.id;

  const pairNames = isWebsiteSocialPair ? websiteSocialPairProjectNames(name) : null;

  async function notifyAndCreateProject(
    data: {
      name: string;
      kind: PortalKind;
      userId: string | null;
      invitedClientEmail: string | null;
    },
    opts?: { skipNewProjectEmail?: boolean },
  ) {
    const created = await prisma.project.create({
      data: {
        name: data.name,
        portalKind: data.kind,
        userId: data.userId,
        invitedClientEmail: data.invitedClientEmail,
        clientVerifiedAt: null,
        assignedStudioUserId,
      },
    });
    if (data.userId && data.kind !== "BRANDING") {
      await copyUserBrandKitToNewProject(created.id, data.userId);
    }
    if (!opts?.skipNewProjectEmail) {
      await notifyClientNewProject(created.id);
    }
  }

  if (mode === "invite") {
    const inviteEmail = String(formData.get("inviteEmail") ?? "").trim().toLowerCase();
    const inviteFirstName = String(formData.get("inviteFirstName") ?? "").trim();
    if (!registrationEmailOk(inviteEmail)) {
      return { error: "Enter a valid email address for the invite." };
    }
    if (!inviteFirstName) {
      return { error: "Enter the client’s first name." };
    }
    if (inviteFirstName.length > 80) {
      return { error: "First name is too long." };
    }
    if (isStudioUser(inviteEmail)) {
      return { error: "Use a client email, not a studio login." };
    }
    const existingUser = await prisma.user.findUnique({ where: { email: inviteEmail } });
    if (existingUser?.passwordHash) {
      if (isStudioUser(existingUser.email)) {
        return { error: "Use a client email, not a studio login." };
      }
      if (isWebsiteSocialPair && pairNames) {
        await notifyAndCreateProject({
          name: pairNames.website,
          kind: "WEBSITE",
          userId: existingUser.id,
          invitedClientEmail: null,
        });
        await notifyAndCreateProject({
          name: pairNames.social,
          kind: "SOCIAL",
          userId: existingUser.id,
          invitedClientEmail: null,
        });
      } else if (portalKind) {
        await notifyAndCreateProject({
          name,
          kind: portalKind,
          userId: existingUser.id,
          invitedClientEmail: null,
        });
      }
    } else {
      const token = randomBytes(32).toString("hex");
      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const inviteSentAt = new Date();
      let invitedUserId: string;
      if (existingUser && !existingUser.passwordHash) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firstName: inviteFirstName,
            name: inviteFirstName,
            clientInviteToken: token,
            clientInviteExpiresAt: inviteExpires,
            clientInviteSentAt: inviteSentAt,
          },
        });
        invitedUserId = existingUser.id;
      } else {
        const createdClient = await prisma.user.create({
          data: {
            email: inviteEmail,
            passwordHash: null,
            firstName: inviteFirstName,
            name: inviteFirstName,
            clientInviteToken: token,
            clientInviteExpiresAt: inviteExpires,
            clientInviteSentAt: inviteSentAt,
          },
        });
        invitedUserId = createdClient.id;
      }
      const registerUrl = `${getPortalPublicOrigin()}/portal/invite?token=${encodeURIComponent(token)}`;
      if (isWebsiteSocialPair && pairNames) {
        await notifyAndCreateProject(
          {
            name: pairNames.website,
            kind: "WEBSITE",
            userId: invitedUserId,
            invitedClientEmail: null,
          },
          { skipNewProjectEmail: true },
        );
        await notifyAndCreateProject(
          {
            name: pairNames.social,
            kind: "SOCIAL",
            userId: invitedUserId,
            invitedClientEmail: null,
          },
          { skipNewProjectEmail: true },
        );
      } else if (portalKind) {
        await notifyAndCreateProject(
          {
            name,
            kind: portalKind,
            userId: invitedUserId,
            invitedClientEmail: null,
          },
          { skipNewProjectEmail: true },
        );
      }
      await sendClientPortalInviteEmail({
        to: inviteEmail,
        firstName: inviteFirstName,
        registerUrl,
      });
    }
  } else {
    const clientUserId = String(formData.get("clientUserId") ?? "").trim();
    if (!clientUserId) {
      return { error: "Choose the client this project belongs to." };
    }
    const client = await prisma.user.findUnique({ where: { id: clientUserId } });
    if (!client || isStudioUser(client.email)) {
      return { error: "Invalid client selected." };
    }
    if (isWebsiteSocialPair && pairNames) {
      await notifyAndCreateProject({
        name: pairNames.website,
        kind: "WEBSITE",
        userId: client.id,
        invitedClientEmail: null,
      });
      await notifyAndCreateProject({
        name: pairNames.social,
        kind: "SOCIAL",
        userId: client.id,
        invitedClientEmail: null,
      });
    } else if (portalKind) {
      await notifyAndCreateProject({
        name,
        kind: portalKind,
        userId: client.id,
        invitedClientEmail: null,
      });
    }
  }

  revalidatePath("/portal");
  redirect(isWebsiteSocialPair ? "/portal?created=pair" : "/portal?created=1");
}

export async function signOffCalendarItem(
  projectId: string,
  itemId: string,
  formData?: FormData,
): Promise<PortalFormFlash> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email) || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t approve this post. Try again.");
  }
  if (!clientMayUseSocialPortal(project.portalKind)) {
    return portalFlashErr("Couldn’t approve this post. Try again.");
  }
  const item = await prisma.contentCalendarItem.findFirst({
    where: { id: itemId, projectId },
  });
  if (!item) {
    return portalFlashErr("Couldn’t approve this post. Try again.");
  }
  if (
    item.postWorkflowStatus === "APPROVED" ||
    (item.clientSignedOff &&
      item.postWorkflowStatus !== "PENDING_APPROVAL" &&
      item.postWorkflowStatus !== "REVISION_NEEDED")
  ) {
    return portalFlashErr("This post can’t be approved in its current state.");
  }

  const log = appendCalendarActivityLog(item.calendarActivityLogJson, {
    kind: "client_approved",
    summary: "Client approved this post for scheduling",
  });

  await prisma.contentCalendarItem.update({
    where: { id: itemId },
    data: {
      clientSignedOff: true,
      signedOffAt: new Date(),
      postWorkflowStatus: "APPROVED",
      clientFeedback: null,
      calendarActivityLogJson: log,
    },
  });
  const postLabel = (item.title?.trim() || item.caption?.trim() || "Post").slice(0, 120);
  await notifyStudioTeamCalendarPostApproved(projectId, project.name, itemId, postLabel);
  await notifyCalendarPostSignedOff(projectId, project.name);
  await revalidateProject(projectId);
  return portalFlashOk("Post approved ✓");
}

export async function approveDiscovery(projectId: string, formData?: FormData): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email)) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  await prisma.project.update({
    where: { id: projectId },
    data: { discoveryApprovedAt: new Date() },
  });
  await notifyClientDiscoveryApproved(projectId);
  await revalidateProject(projectId);
}

type StudioCalendarPostCreateResult =
  | { ok: false }
  | {
      ok: true;
      projectId: string;
      isDraft: boolean;
      scheduledFor: Date;
      label: string;
      channelsJson: string;
    };

async function tryCreateContentCalendarPostFromStudioForm(
  projectId: string,
  formData: FormData,
  studioUserId: string,
  studioEmail: string,
): Promise<StudioCalendarPostCreateResult> {
  if (!isStudioUser(studioEmail)) return { ok: false };
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { ok: false };
  const studioMember = await prisma.studioTeamMember.findUnique({
    where: { userId: studioUserId },
    select: { personaSlug: true },
  });
  if (!studioMayAccessProjectSocialCalendar(project, studioUserId, studioMember?.personaSlug ?? null)) {
    return { ok: false };
  }
  const portalKind = normalizePortalKind(project.portalKind);
  if (portalKind !== "MULTI" && portalKind !== "SOCIAL") return { ok: false };

  const intent = String(formData.get("intent") ?? "submit").trim();
  const isDraft = intent === "draft";

  const caption = String(formData.get("caption") ?? "").trim();
  const hashtags = String(formData.get("hashtags") ?? "").trim().slice(0, 2000);
  const title = String(formData.get("title") ?? "").trim() || null;
  const scheduledRaw = String(formData.get("scheduledFor") ?? "").trim();
  const scheduledFor = scheduledRaw ? new Date(scheduledRaw) : null;
  if (!caption) return { ok: false };
  if (!scheduledFor || Number.isNaN(scheduledFor.getTime())) return { ok: false };

  let imagePath: string | null = null;
  let postFormat = "GRAPHIC";
  const file = formData.get("creative");
  if (file instanceof File && file.size > 0) {
    const bad = validateUploadExtension(file.name, "socialCalendarCreative");
    if (bad) return { ok: false };
    const mediaKind = socialCalendarUploadMediaKind(file.name);
    if (!mediaKind) return { ok: false };
    const buf = Buffer.from(await file.arrayBuffer());
    const maxBytes = mediaKind === "video" ? 80 * 1024 * 1024 : 15 * 1024 * 1024;
    if (buf.length > maxBytes) return { ok: false };
    try {
      imagePath = await saveProjectUpload(projectId, file.name, buf, "socialCalendarCreative");
    } catch (e) {
      rethrowPortalUploadAction("addCalendarPost creative", e);
    }
    postFormat = mediaKind === "video" ? "VIDEO" : "GRAPHIC";
  } else if (!isDraft) {
    return { ok: false };
  }

  const channelsJson = JSON.stringify(normalizeCalendarChannelsFromForm(formData));

  const { formatYm } = await import("@/lib/social-batch-calendar");
  const planMonthKey = formatYm(scheduledFor.getFullYear(), scheduledFor.getMonth());

  await prisma.contentCalendarItem.create({
    data: {
      projectId,
      caption,
      hashtags,
      title,
      scheduledFor,
      imagePath,
      channelsJson,
      postFormat,
      planMonthKey,
      isPlanPlaceholder: false,
      postWorkflowStatus: isDraft ? "DRAFT" : "PENDING_APPROVAL",
    },
  });
  const label = title?.trim() || caption.slice(0, 160);
  return { ok: true, projectId, isDraft, scheduledFor, label, channelsJson };
}

export async function addCalendarPost(projectId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return;
  const result = await tryCreateContentCalendarPostFromStudioForm(
    projectId,
    formData,
    session.user.id,
    session.user.email,
  );
  if (!result.ok) return;
  if (!result.isDraft) {
    await notifyClientCalendarContentAdded(result.projectId, result.label, {
      scheduledIso: result.scheduledFor.toISOString(),
      channelsJson: result.channelsJson,
    });
  }
  await revalidateProject(result.projectId);
  redirect(`/portal/project/${projectId}/social/calendar`);
}

/** Studio aggregate calendar: same as `addCalendarPost` but reads `projectId` from the form and stays on the master view. */
export async function addCalendarPostFromStudioMasterCalendar(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return;
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) return;
  const result = await tryCreateContentCalendarPostFromStudioForm(
    projectId,
    formData,
    session.user.id,
    session.user.email,
  );
  if (!result.ok) return;
  if (!result.isDraft) {
    await notifyClientCalendarContentAdded(result.projectId, result.label, {
      scheduledIso: result.scheduledFor.toISOString(),
      channelsJson: result.channelsJson,
    });
  }
  await revalidateProject(result.projectId);
  revalidatePath("/portal/studio-social-calendar");
}

export async function saveWebsiteColours(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) {
    return portalFlashErr("You don’t have permission to update colours.");
  }
  if (!canClientUseBrandKitUploads(project)) {
    return portalFlashErr("Brand kit uploads aren’t available for this project yet.");
  }
  if (!clientMayEditWebsiteBrandKitFields(project.portalKind)) {
    return portalFlashErr("You can’t edit brand kit fields on this project.");
  }
  const primary = String(formData.get("primaryHex") ?? "").trim();
  const secondary = String(formData.get("secondaryHex") ?? "").trim();
  const accent = String(formData.get("accentHex") ?? "").trim();
  const quaternary = String(formData.get("quaternaryHex") ?? "").trim();

  const p = normalizeWebsiteHexInput(primary);
  const sec = normalizeWebsiteHexInput(secondary);
  const acc = normalizeWebsiteHexInput(accent);
  const quat = normalizeWebsiteHexInput(quaternary);
  if (primary && p === null) {
    return portalFlashErr("Primary colour isn’t a valid hex (use 3 or 6 characters, with or without #).");
  }
  if (secondary && sec === null) {
    return portalFlashErr("Secondary colour isn’t a valid hex.");
  }
  if (accent && acc === null) {
    return portalFlashErr("Accent colour isn’t a valid hex.");
  }
  if (quaternary && quat === null) {
    return portalFlashErr("Additional colour isn’t a valid hex.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      websitePrimaryHex: p,
      websiteSecondaryHex: sec,
      websiteAccentHex: acc,
      websiteQuaternaryHex: quat,
    },
  });
  await revalidateProject(projectId);
  return portalFlashOk("Colours saved.");
}

export async function uploadWebsiteFont(projectId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) return;
  if (!canClientUseBrandKitUploads(project)) return;
  if (!clientMayEditWebsiteBrandKitFields(project.portalKind)) return;
  const file = formData.get("font");
  if (!(file instanceof File) || file.size === 0) return;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 12 * 1024 * 1024) return;
  const lower = file.name.toLowerCase();
  if (!/\.(woff2?|ttf|otf)$/.test(lower)) return;
  try {
    const rel = await saveFontUpload(projectId, file.name, buf);
    const paths = parseFontPaths(project.websiteFontPaths);
    paths.push(rel);
    await prisma.project.update({
      where: { id: projectId },
      data: { websiteFontPaths: JSON.stringify(paths) },
    });
    await revalidateProject(projectId);
  } catch (e) {
    rethrowPortalUploadAction("uploadWebsiteFont", e);
  }
}

export async function uploadWebsiteLogo(projectId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) return;
  if (!canClientUseBrandKitUploads(project)) return;
  if (!clientMayEditWebsiteBrandKitFields(project.portalKind)) return;
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return;
  const okVec = validateUploadExtension(file.name, "vector") === null;
  const okRaster = validateUploadExtension(file.name, "raster") === null;
  if (!okVec && !okRaster) return;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) return;
  const kind = okVec ? "vector" : "raster";
  try {
    const rel = await saveProjectUpload(projectId, file.name, buf, kind);
    await prisma.project.update({
      where: { id: projectId },
      data: { websiteLogoPath: rel },
    });
    await revalidateProject(projectId);
  } catch (e) {
    rethrowPortalUploadAction("uploadWebsiteLogo", e);
  }
}

export async function clearWebsiteLogo(projectId: string, formData?: FormData): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) return;
  if (!canClientUseBrandKitUploads(project)) return;
  if (!clientMayEditWebsiteBrandKitFields(project.portalKind)) return;
  await deleteUploadThingFileByStoredValue(project.websiteLogoPath);
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteLogoPath: null },
  });
  await revalidateProject(projectId);
}

const MAX_WEBSITE_LOGO_VARIATIONS = 10;

export async function uploadWebsiteLogoVariation(projectId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) return;
  if (!canClientUseBrandKitUploads(project)) return;
  if (!clientMayEditWebsiteBrandKitFields(project.portalKind)) return;
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) return;
  const okVec = validateUploadExtension(file.name, "vector") === null;
  const okRaster = validateUploadExtension(file.name, "raster") === null;
  if (!okVec && !okRaster) return;

  const variations = parseWebsiteLogoVariations(project.websiteLogoVariationsJson);
  if (variations.length >= MAX_WEBSITE_LOGO_VARIATIONS) return;

  const kind = normalizeVariationKind(String(formData.get("variationKind") ?? "secondary"));
  const customRaw = String(formData.get("customLabel") ?? "").trim().slice(0, 80);
  const customLabel = kind === "other" && customRaw ? customRaw : undefined;

  const uploadKind = okVec ? "vector" : "raster";
  try {
    const rel = await saveProjectUpload(projectId, file.name, buf, uploadKind);
    variations.push({ path: rel, kind, customLabel });
    await prisma.project.update({
      where: { id: projectId },
      data: { websiteLogoVariationsJson: JSON.stringify(variations) },
    });
    await revalidateProject(projectId);
  } catch (e) {
    rethrowPortalUploadAction("uploadWebsiteLogoVariation", e);
  }
}

export async function removeWebsiteLogoVariation(
  projectId: string,
  index: number,
  formData?: FormData,
): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) return;
  if (!canClientUseBrandKitUploads(project)) return;
  if (!clientMayEditWebsiteBrandKitFields(project.portalKind)) return;
  const variations = parseWebsiteLogoVariations(project.websiteLogoVariationsJson);
  if (index < 0 || index >= variations.length) return;
  const removed = variations[index];
  await deleteUploadThingFileByStoredValue(removed?.path);
  variations.splice(index, 1);
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteLogoVariationsJson: JSON.stringify(variations) },
  });
  await revalidateProject(projectId);
}

export async function removeWebsiteFont(
  projectId: string,
  index: number,
  formData?: FormData,
): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) return;
  if (!canClientUseBrandKitUploads(project)) return;
  if (!clientMayEditWebsiteBrandKitFields(project.portalKind)) return;
  const paths = parseFontPaths(project.websiteFontPaths);
  if (index < 0 || index >= paths.length) return;
  const removed = paths[index];
  await deleteUploadThingFileByStoredValue(removed);
  paths.splice(index, 1);
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteFontPaths: JSON.stringify(paths) },
  });
  await revalidateProject(projectId);
}

export async function toggleWebsiteKitSignedOff(
  projectId: string,
  next: boolean,
  formData?: FormData,
): Promise<PortalFormFlash> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) {
    return portalFlashErr("You don’t have permission to update sign-off.");
  }
  if (!clientHasFullPortalAccess(project)) {
    return portalFlashErr("Your account must be verified before you can sign off the kit.");
  }
  const vis = visiblePortalSections(project.portalKind);
  const signageBrandKitPath = vis.signage && !vis.website;
  const printBrandKitPath = normalizePortalKind(project.portalKind) === "PRINT";
  if (signageBrandKitPath || printBrandKitPath) {
    /* Signage- or print-only projects use project kit fields without a website workstream. */
  } else {
    if (!clientMayUseWebsiteWorkstream(project.portalKind)) {
      return portalFlashErr("Website brand kit isn’t part of this project.");
    }
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteKitSignedOff: next },
  });
  if (next) await notifyWebsiteKitSignedOff(projectId, project.name);
  await revalidateProject(projectId);
  return portalFlashOk(next ? "Brand kit signed off — thank you." : "Sign-off cleared.");
}

export async function toggleWebsiteContentSignedOff(
  projectId: string,
  next: boolean,
  formData?: FormData,
): Promise<PortalFormFlash> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) {
    return portalFlashErr("You don’t have permission to update sign-off.");
  }
  if (!clientHasFullPortalAccess(project)) {
    return portalFlashErr("Your account must be verified before you can sign off.");
  }
  if (!clientMayUseWebsiteWorkstream(project.portalKind)) {
    return portalFlashErr("Website content isn’t part of this project.");
  }
  if (next) {
    const briefs = await prisma.websitePageBrief.findMany({
      where: { projectId },
      orderBy: { pageIndex: "asc" },
    });
    if (websitePageContentHubProgressPercent({ ...project, websiteContentSignedOff: false }, briefs) < 100) {
      return portalFlashErr(
        "Complete every required page in the content hub (100% progress) before signing off — optional pages don’t block this.",
      );
    }
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteContentSignedOff: next },
  });
  await revalidateProject(projectId);
  return portalFlashOk(next ? "Content signed off." : "Content sign-off cleared.");
}

export async function toggleWebsitePreviewSignedOff(
  projectId: string,
  next: boolean,
  formData?: FormData,
): Promise<PortalFormFlash> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) {
    return portalFlashErr("You don’t have permission to update sign-off.");
  }
  if (!clientHasFullPortalAccess(project)) {
    return portalFlashErr("Your account must be verified before you can sign off.");
  }
  if (!clientMayUseWebsiteWorkstream(project.portalKind)) {
    return portalFlashErr("Website preview isn’t part of this project.");
  }
  if (next && !project.websiteLiveUrl?.trim()) {
    return portalFlashErr("Add your live site URL above before signing off the preview.");
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { websitePreviewSignedOff: next },
  });
  await revalidateProject(projectId);
  return portalFlashOk(next ? "Preview signed off." : "Preview sign-off cleared.");
}

export async function toggleWebsiteLaunchSignedOff(
  projectId: string,
  next: boolean,
  formData?: FormData,
): Promise<PortalFormFlash> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email)) {
    return portalFlashErr("You don’t have permission to update sign-off.");
  }
  if (!clientHasFullPortalAccess(project)) {
    return portalFlashErr("Your account must be verified before you can sign off.");
  }
  if (!clientMayUseWebsiteWorkstream(project.portalKind)) {
    return portalFlashErr("Launch details aren’t part of this project.");
  }
  if (next && (!project.websiteClientDomain?.trim() || !project.websiteDomainProvider?.trim())) {
    return portalFlashErr("Fill in your domain and provider before signing off launch.");
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteLaunchSignedOff: next },
  });
  await revalidateProject(projectId);
  return portalFlashOk(next ? "Launch signed off." : "Launch sign-off cleared.");
}

export async function signOffReviewAsset(formData: FormData): Promise<PortalFormFlash> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const assetId = String(formData.get("assetId") ?? "").trim();
  if (!projectId || !assetId) {
    return portalFlashErr("Couldn’t approve this proof. Try again.");
  }

  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email) || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t approve this proof. Try again.");
  }
  const uid = session?.user?.id;
  if (uid && (await clientIsBlockedByPendingOffboarding(projectId, uid))) {
    return portalFlashErr("Couldn’t approve this proof. Try again.");
  }
  const asset = await prisma.reviewAsset.findFirst({
    where: { id: assetId, projectId },
  });
  if (!asset) {
    return portalFlashErr("Couldn’t approve this proof. Try again.");
  }
  const reviewKind = asset.kind;
  if (reviewKind !== "BRANDING" && reviewKind !== "SIGNAGE" && reviewKind !== "GENERAL") {
    return portalFlashErr("Couldn’t approve this proof. Try again.");
  }
  if (!clientMaySignOffReviewAssetKind(project.portalKind, reviewKind)) {
    return portalFlashErr("Couldn’t approve this proof. Try again.");
  }
  await prisma.reviewAsset.update({
    where: { id: assetId },
    data: { clientSignedOff: true, signedOffAt: new Date() },
  });
  await notifyReviewAssetSignedOff(projectId, project.name, asset.kind);
  const assigneeEmails = await resolveRecipientEmailsForReviewAssetSignoff(projectId, asset.kind);
  await emailNotifyAssigneesReviewAssetApproved({
    recipientEmails: assigneeEmails,
    projectName: project.name,
    projectId,
    assetKind: asset.kind,
  });
  await revalidateProject(projectId);
  return portalFlashOk("Approved ✓");
}

export async function postProjectMessage(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || !session?.user?.email) {
    return portalFlashErr("Couldn’t send your message. Try again.");
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body || body.length > 8000) {
    return portalFlashErr("Message is empty or too long.");
  }

  const studio = isStudioUser(session.user.email);
  if (!studio && !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t send your message. Try again.");
  }
  if (
    !studio &&
    session.user?.id &&
    (await clientIsBlockedByPendingOffboarding(projectId, session.user.id))
  ) {
    return portalFlashErr("Couldn’t send your message. Try again.");
  }
  const authorRole = studio ? "STUDIO" : "CLIENT";
  const authorName =
    session.user.name?.trim() ||
    session.user.email.split("@")[0] ||
    (studio ? "Studio" : "Client");

  await prisma.projectMessage.create({
    data: {
      projectId,
      authorRole,
      authorName,
      body,
      authorUserId: session.user.id,
    },
  });
  if (studio) await notifyClientStudioMessage(projectId);
  if (!studio) {
    await appendClientMessageTodo(projectId, project.name, body);
    await notifyStudioTeamClientMessage(projectId, project.name, body);
  }
  await revalidateProject(projectId);
  return portalFlashOk("Message sent ✓");
}

/** Client only — optional portrait shown next to their messages in project threads. */
export async function saveClientProfilePhoto(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return;
  if (isStudioUser(session.user.email)) return;

  const file = formData.get("photo");
  if (!file || typeof file === "string" || file.size === 0) return;
  if (file.size > 4 * 1024 * 1024) return;

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePhotoPath: true },
  });
  if (!user) return;

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const rel = await saveClientAvatarFile(userId, file.name, buf);
    await removeOldAvatarFile(user.profilePhotoPath);
    await prisma.user.update({
      where: { id: userId },
      data: { profilePhotoPath: rel },
    });

    revalidatePath("/portal");
    revalidatePath("/portal/brand-kit");
    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true },
    });
    for (const p of projects) {
      await revalidateProject(p.id);
    }
  } catch (e) {
    console.error("[portal upload] saveClientProfilePhoto", e);
    throw new Error(formatPortalUploadFailureForUser(e));
  }
}

/** Studio only — removes a message from the project thread (e.g. after it’s been handled). */
export async function deleteProjectMessage(
  projectId: string,
  messageId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email)) return;

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) return;

  const existing = await prisma.projectMessage.findFirst({
    where: { id: messageId, projectId },
    select: { id: true },
  });
  if (!existing) return;

  await prisma.projectMessage.delete({ where: { id: messageId } });
  await revalidateProject(projectId);
}

function parseReviewAssetKind(raw: string): "BRANDING" | "SIGNAGE" | "GENERAL" | null {
  if (raw === "BRANDING" || raw === "SIGNAGE" || raw === "GENERAL") return raw;
  return null;
}

export async function addReviewAsset(formData: FormData): Promise<PortalFormFlash> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const kind = parseReviewAssetKind(String(formData.get("reviewAssetKind") ?? ""));
  if (!projectId || !kind) {
    return portalFlashErr("Upload failed - try again");
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email)) {
    return portalFlashErr("Upload failed - try again");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return portalFlashErr("Upload failed - try again");
  }
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!title) {
    return portalFlashErr("Add a title for this proof.");
  }

  let filePath: string | null = null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const bad = validateUploadExtension(file.name, "reviewAsset");
    if (bad) {
      return portalFlashErr("That file type isn’t allowed.");
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > 20 * 1024 * 1024) {
      return portalFlashErr("File is too large (max 20 MB).");
    }
    try {
      filePath = await saveProjectUpload(projectId, file.name, buf, "reviewAsset");
    } catch (e) {
      rethrowPortalUploadAction("addReviewAsset upload", e);
    }
  }

  try {
    await prisma.reviewAsset.create({
      data: {
        projectId,
        kind,
        title,
        notes,
        filePath,
      },
    });
    await notifyClientReviewAssetAdded(projectId, kind, title);
    await revalidateProject(projectId);
  } catch (e) {
    rethrowPortalUploadAction("addReviewAsset persist", e);
  }
  return portalFlashOk("Proof uploaded ✓");
}

export async function ensureWebsiteKitPreviewToken(projectId: string, formData?: FormData): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project) return;
  if (!canManageWebsiteSitemap(session, project)) return;
  if (!isStudioUser(session?.user?.email) && !clientMayUseWebsiteWorkstream(project.portalKind)) return;
  if (!isStudioUser(session?.user?.email) && !clientHasFullPortalAccess(project)) return;
  if (project.websiteKitPreviewToken) return;
  const token = newWebsiteKitPreviewToken();
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteKitPreviewToken: token },
  });
  await revalidateProject(projectId);
  revalidatePath(`/preview/website-kit/${token}`);
}

export async function rotateWebsiteKitPreviewToken(projectId: string, formData?: FormData): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project) return;
  if (!canManageWebsiteSitemap(session, project)) return;
  if (!isStudioUser(session?.user?.email) && !clientMayUseWebsiteWorkstream(project.portalKind)) return;
  if (!isStudioUser(session?.user?.email) && !clientHasFullPortalAccess(project)) return;
  const prev = project.websiteKitPreviewToken;
  const token = newWebsiteKitPreviewToken();
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteKitPreviewToken: token },
  });
  await revalidateProject(projectId);
  if (prev) revalidatePath(`/preview/website-kit/${prev}`);
  revalidatePath(`/preview/website-kit/${token}`);
}

export async function setWebsiteSitemap(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project) {
    return portalFlashErr("Couldn’t save sitemap. Try again.");
  }
  if (!canManageWebsiteSitemap(session, project)) {
    return portalFlashErr("Couldn’t save sitemap. Try again.");
  }
  if (!isStudioUser(session?.user?.email) && !clientMayUseWebsiteWorkstream(project.portalKind)) {
    return portalFlashErr("Couldn’t save sitemap. Try again.");
  }
  if (!isStudioUser(session?.user?.email) && !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t save sitemap. Try again.");
  }

  const studioUser = isStudioUser(session?.user?.email);
  let count: number;
  if (studioUser) {
    const countRaw = Number(formData.get("pageCount"));
    count = Number.isFinite(countRaw) ? Math.min(8, Math.max(1, Math.floor(countRaw))) : 4;
  } else {
    if (!clientHasFullPortalAccess(project) || session?.user?.id !== project.userId) {
      return portalFlashErr("Couldn’t save sitemap. Try again.");
    }
    count = project.websitePageCount;
  }

  const labelsRaw = String(formData.get("labels") ?? "");
  const lines = labelsRaw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, count);
  const labels = Array.from({ length: count }, (_, i) => lines[i] || `Page ${i + 1}`);

  await prisma.websitePageBrief.deleteMany({
    where: { projectId, pageIndex: { gte: count } },
  });
  await prisma.project.update({
    where: { id: projectId },
    data: {
      websitePageCount: count,
      websitePageLabels: JSON.stringify(labels),
    },
  });
  await ensureWebsitePageBriefRecords(projectId, count);
  await revalidateProject(projectId);
  return portalFlashOk("Sitemap saved ✓");
}

export async function saveWebsitePageBrief(
  projectId: string,
  pageIndex: number,
  formData: FormData,
): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project) || isStudioUser(session?.user?.email)) {
    return portalFlashErr("Couldn’t save this page. Try again.");
  }
  if (!clientMayUseWebsiteWorkstream(project.portalKind)) {
    return portalFlashErr("Couldn’t save this page. Try again.");
  }
  if (pageIndex < 0 || pageIndex >= project.websitePageCount) {
    return portalFlashErr("Couldn’t save this page. Try again.");
  }

  const headline = String(formData.get("headline") ?? "").trim() || null;
  const bodyCopy = String(formData.get("bodyCopy") ?? "").trim();

  const existing = await prisma.websitePageBrief.findUnique({
    where: { projectId_pageIndex: { projectId, pageIndex } },
  });
  const paths = parsePageImagePaths(existing?.imagePaths ?? "[]");

  const uploads = formData.getAll("images");
  try {
    for (const file of uploads) {
      if (!(file instanceof File) || file.size === 0) continue;
      if (paths.length >= 12) break;
      if (validateUploadExtension(file.name, "raster") !== null) continue;
      const buf = Buffer.from(await file.arrayBuffer());
      if (buf.length > 8 * 1024 * 1024) continue;
      const rel = await saveProjectUpload(projectId, file.name, buf, "raster");
      paths.push(rel);
    }

    await prisma.websitePageBrief.upsert({
      where: { projectId_pageIndex: { projectId, pageIndex } },
      create: { projectId, pageIndex, headline, bodyCopy, imagePaths: JSON.stringify(paths) },
      update: { headline, bodyCopy, imagePaths: JSON.stringify(paths) },
    });
    await revalidateProject(projectId);
  } catch (e) {
    rethrowPortalUploadAction("saveWebsitePageBrief", e);
  }
  return portalFlashOk("Page content saved ✓");
}

export async function removeWebsitePageImage(
  projectId: string,
  pageIndex: number,
  imageIndex: number,
  formData?: FormData,
): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project) || isStudioUser(session?.user?.email)) return;
  if (!clientMayUseWebsiteWorkstream(project.portalKind)) return;
  if (pageIndex < 0 || pageIndex >= project.websitePageCount) return;

  const brief = await prisma.websitePageBrief.findUnique({
    where: { projectId_pageIndex: { projectId, pageIndex } },
  });
  if (!brief) return;
  const paths = parsePageImagePaths(brief.imagePaths);
  if (imageIndex < 0 || imageIndex >= paths.length) return;
  const removed = paths[imageIndex];
  await deleteUploadThingFileByStoredValue(removed);
  paths.splice(imageIndex, 1);
  await prisma.websitePageBrief.update({
    where: { projectId_pageIndex: { projectId, pageIndex } },
    data: { imagePaths: JSON.stringify(paths) },
  });
  await revalidateProject(projectId);
}

export async function verifyClient(projectId: string, formData?: FormData): Promise<void> {
  void formData;
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) return;
  if (!(await sessionStudioPersonaIsIssy())) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  const now = new Date();
  await prisma.project.update({
    where: { id: projectId },
    data: {
      clientVerifiedAt: now,
      clientContractSignedAt: now,
      studioDepositMarkedPaidAt: now,
    },
  });
  await notifyClientAccountVerified(projectId);
  await revalidateProject(projectId);
}

/** Studio: mark client contract signed (granular gate). Social-only needs this alone for full access. */
export async function markClientContractSigned(formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) {
    return portalFlashErr("Couldn’t update contract status. Try again.");
  }
  if (!(await sessionStudioPersonaIsIssy())) {
    return portalFlashErr("Couldn’t update contract status. Try again.");
  }
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) {
    return portalFlashErr("Couldn’t update contract status. Try again.");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return portalFlashErr("Couldn’t update contract status. Try again.");
  }
  const wasSigned = Boolean(project.clientContractSignedAt);
  await prisma.project.update({
    where: { id: projectId },
    data: project.clientContractSignedAt
      ? {
          clientContractSignedAt: null,
          contractSignedTypedName: null,
          contractSignedIp: null,
          contractSignedSnapshotText: null,
        }
      : { clientContractSignedAt: new Date() },
  });
  await revalidateProject(projectId);
  return portalFlashOk(wasSigned ? "Contract signed status cleared ✓" : "Contract marked signed ✓");
}

export type SignProjectContractResult = { ok: true } | { ok: false; error: string };

/** Client: in-portal contract sign-off (typed name + agreement). Records snapshot and IP. */
export async function signProjectContractInPortal(
  projectId: string,
  typedName: string,
  agreed: boolean,
): Promise<SignProjectContractResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || isStudioUser(session.user.email)) {
    return { ok: false, error: "You must be signed in as the client." };
  }
  const project = await getProjectForSession(projectId, session);
  if (!project || project.userId !== session.user.id) {
    return { ok: false, error: "Project not found." };
  }
  if (project.clientContractSignedAt) {
    return { ok: false, error: "This contract is already signed." };
  }
  const terms = (project.contractTermsText ?? "").trim();
  if (!terms) {
    return { ok: false, error: "The studio has not published your agreement yet. Please check back soon." };
  }
  const name = typedName.trim();
  if (name.length < 2 || name.length > 200) {
    return { ok: false, error: "Enter your full name as it should appear on the agreement." };
  }
  if (!agreed) {
    return { ok: false, error: "Please confirm you have read and agree to the terms." };
  }

  const h = await import("next/headers").then((m) => m.headers());
  const fwd = h.get("x-forwarded-for");
  const ip =
    fwd
      ?.split(",")[0]
      ?.trim()
      .slice(0, 80) ||
    h.get("x-real-ip")?.trim().slice(0, 80) ||
    "unknown";

  const now = new Date();
  await prisma.project.update({
    where: { id: projectId },
    data: {
      clientContractSignedAt: now,
      contractSignedTypedName: name,
      contractSignedIp: ip,
      contractSignedSnapshotText: terms,
    },
  });

  await notifyIssyClientSignedContractInPortal({
    projectId,
    projectName: project.name,
    signedName: name,
    signedAt: now,
    signedIp: ip,
  });

  await revalidateProject(projectId);
  return { ok: true };
}

/** Studio: mark deposit received (required with contract for non–social full access). */
export async function markStudioDepositReceived(formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) {
    return portalFlashErr("Couldn’t update deposit status. Try again.");
  }
  if (!(await sessionStudioPersonaIsIssy())) {
    return portalFlashErr("Couldn’t update deposit status. Try again.");
  }
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) {
    return portalFlashErr("Couldn’t update deposit status. Try again.");
  }
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: { select: { email: true, name: true, businessName: true } },
    },
  });
  if (!project) {
    return portalFlashErr("Couldn’t update deposit status. Try again.");
  }
  const markingPaid = !project.studioDepositMarkedPaidAt;
  await prisma.project.update({
    where: { id: projectId },
    data: { studioDepositMarkedPaidAt: project.studioDepositMarkedPaidAt ? null : new Date() },
  });
  if (markingPaid) {
    const to = project.user?.email?.trim().toLowerCase();
    if (to) {
      const plain =
        project.user?.name?.trim().split(/\s+/)[0] ||
        project.user?.businessName?.trim() ||
        "there";
      await emailNotifyClientDepositPaidHubUnlocked({
        to,
        greeting: plain,
        projectName: project.name,
        projectId,
      });
    }
  }
  await revalidateProject(projectId);
  return portalFlashOk(
    markingPaid ? "Deposit marked paid ✓" : "Deposit status cleared ✓",
  );
}

/** Client: save this project’s brand fields to their account kit for reuse on future projects. */
export async function saveUserBrandKitFromProject(formData: FormData): Promise<PortalFormFlash> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) {
    return portalFlashErr("Couldn’t save brand kit. Try again.");
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return portalFlashErr("Couldn’t save brand kit. Try again.");
  }
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session.user.email) || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t save brand kit. Try again.");
  }
  if (session.user.id !== project.userId) {
    return portalFlashErr("Couldn’t save brand kit. Try again.");
  }

  await prisma.userBrandKit.upsert({
    where: { userId: project.userId! },
    create: {
      userId: project.userId!,
      websitePrimaryHex: project.websitePrimaryHex,
      websiteSecondaryHex: project.websiteSecondaryHex,
      websiteAccentHex: project.websiteAccentHex,
      websiteQuaternaryHex: project.websiteQuaternaryHex,
      websiteFontPaths: project.websiteFontPaths,
      websiteLogoPath: project.websiteLogoPath,
      websiteLogoVariationsJson: project.websiteLogoVariationsJson,
    },
    update: {
      websitePrimaryHex: project.websitePrimaryHex,
      websiteSecondaryHex: project.websiteSecondaryHex,
      websiteAccentHex: project.websiteAccentHex,
      websiteQuaternaryHex: project.websiteQuaternaryHex,
      websiteFontPaths: project.websiteFontPaths,
      websiteLogoPath: project.websiteLogoPath,
      websiteLogoVariationsJson: project.websiteLogoVariationsJson,
    },
  });
  revalidatePath("/portal");
  revalidatePath(`/portal/project/${projectId}`);
  return portalFlashOk("Brand kit saved to your account ✓");
}

/** Client: apply saved account brand kit to this project (fills empty project fields only). */
export async function applyUserBrandKitToProject(formData: FormData): Promise<PortalFormFlash> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) {
    return portalFlashErr("Couldn’t apply brand kit. Try again.");
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return portalFlashErr("Couldn’t apply brand kit. Try again.");
  }
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session.user.email) || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t apply brand kit. Try again.");
  }
  if (session.user.id !== project.userId) {
    return portalFlashErr("Couldn’t apply brand kit. Try again.");
  }

  const kit = await prisma.userBrandKit.findUnique({ where: { userId: project.userId! } });
  if (!kit) {
    return portalFlashErr("No saved account brand kit to apply.");
  }

  const data: Prisma.ProjectUpdateInput = {};
  if (!project.websitePrimaryHex?.trim() && kit.websitePrimaryHex?.trim()) {
    data.websitePrimaryHex = kit.websitePrimaryHex;
  }
  if (!project.websiteSecondaryHex?.trim() && kit.websiteSecondaryHex?.trim()) {
    data.websiteSecondaryHex = kit.websiteSecondaryHex;
  }
  if (!project.websiteAccentHex?.trim() && kit.websiteAccentHex?.trim()) {
    data.websiteAccentHex = kit.websiteAccentHex;
  }
  if (!project.websiteQuaternaryHex?.trim() && kit.websiteQuaternaryHex?.trim()) {
    data.websiteQuaternaryHex = kit.websiteQuaternaryHex;
  }
  if ((!project.websiteFontPaths || project.websiteFontPaths === "[]") && kit.websiteFontPaths !== "[]") {
    data.websiteFontPaths = kit.websiteFontPaths;
  }
  if (!project.websiteLogoPath?.trim() && kit.websiteLogoPath?.trim()) {
    data.websiteLogoPath = kit.websiteLogoPath;
  }
  if (
    (!project.websiteLogoVariationsJson || project.websiteLogoVariationsJson === "[]") &&
    kit.websiteLogoVariationsJson !== "[]"
  ) {
    data.websiteLogoVariationsJson = kit.websiteLogoVariationsJson;
  }
  if (Object.keys(data).length === 0) {
    return portalFlashErr("Nothing to apply — project fields are already filled.");
  }
  await prisma.project.update({ where: { id: projectId }, data });
  await revalidateProject(projectId);
  return portalFlashOk("Account brand kit applied ✓");
}

export async function setPortalKind(projectId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) return;
  if (!(await sessionStudioPersonaIsIssy())) return;
  const raw = String(formData.get("portalKind") ?? "WEBSITE");
  const nextKind = normalizePortalKind(raw);
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    select: { portalKind: true },
  });
  if (!existing) return;
  if (nextKind === "ONE_OFF" && existing.portalKind !== "ONE_OFF") return;
  await prisma.project.update({
    where: { id: projectId },
    data: { portalKind: nextKind },
  });
  await revalidateProject(projectId);
  redirect(`/portal/project/${projectId}#agency-project-header`);
}

export async function setProjectPaymentStatus(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email)) return;
  if (!(await sessionStudioPersonaIsIssy())) return;
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  const status = normalizePaymentStatus(String(formData.get("paymentStatus") ?? "CURRENT"));
  const note = String(formData.get("paymentNoteForClient") ?? "").trim().slice(0, 500);
  await prisma.project.update({
    where: { id: projectId },
    data: { paymentStatus: status, paymentNoteForClient: note },
  });
  await revalidateProject(projectId);
  redirect(`/portal/project/${projectId}#agency-subscription-payment`);
}

function revalidateFinalDesignFileViews(projectId: string) {
  revalidatePath(`/portal/project/${projectId}`);
  revalidatePath(`/portal/project/${projectId}/branding`);
  revalidatePath(`/portal/project/${projectId}/branding/review`);
  revalidatePath(`/portal/project/${projectId}/branding/downloads`);
  revalidatePath(`/portal/project/${projectId}/signage`);
  for (const s of SIGNAGE_STEP_SLUGS) {
    revalidatePath(`/portal/project/${projectId}/signage/${s}`);
  }
  revalidatePath(`/portal/project/${projectId}/deliverables`);
}

/** Client confirms final payment — unlocks downloads for signed-off review assets (server + UI). */
export async function acknowledgeFinalDesignPayment(formData: FormData): Promise<PortalFormFlash> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) {
    return portalFlashErr("Couldn’t confirm payment. Try again.");
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || isStudioUser(session.user.email)) {
    return portalFlashErr("Couldn’t confirm payment. Try again.");
  }
  if (formData.get("confirm") !== "on") {
    return portalFlashErr("Please tick the box to confirm.");
  }

  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t confirm payment. Try again.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { clientAcknowledgedFinalPaymentAt: new Date() },
  });
  revalidateFinalDesignFileViews(projectId);
  return portalFlashOk("Confirmed — downloads unlocked ✓");
}

/** Studio only — if the client confirmed by mistake or payment is disputed. */
export async function resetClientFinalPaymentAcknowledgment(formData: FormData): Promise<PortalFormFlash> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) {
    return portalFlashErr("Couldn’t reset confirmation. Try again.");
  }
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) {
    return portalFlashErr("Couldn’t reset confirmation. Try again.");
  }
  if (!(await sessionStudioPersonaIsIssy())) {
    return portalFlashErr("Couldn’t reset confirmation. Try again.");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return portalFlashErr("Couldn’t reset confirmation. Try again.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { clientAcknowledgedFinalPaymentAt: null },
  });
  revalidateFinalDesignFileViews(projectId);
  return portalFlashOk("Payment confirmation reset ✓");
}

function normalizeClientWebsiteDomain(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = t.includes("://") ? new URL(t) : new URL(`https://${t}`);
    const h = u.hostname.toLowerCase().replace(/^www\./, "");
    return h ? h.slice(0, 253) : null;
  } catch {
    return null;
  }
}

/** Client: domain, DNS host, optional encrypted registrar login/password. Studio cannot submit (view-only vault on domain page). */
export async function saveWebsiteDomainLaunchDetails(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || isStudioUser(session.user.email)) {
    return portalFlashErr("Couldn’t save launch details. Try again.");
  }

  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t save launch details. Try again.");
  }
  if (!clientMayUseWebsiteWorkstream(project.portalKind)) {
    return portalFlashErr("Couldn’t save launch details. Try again.");
  }

  const domainRaw = String(formData.get("websiteClientDomain") ?? "");
  const strippedDomain = domainRaw.trim();
  const provider = String(formData.get("websiteDomainProvider") ?? "").trim().slice(0, 160);
  const loginInput = String(formData.get("websiteDomainRegistrarLogin") ?? "").trim().slice(0, 400);
  const passwordInput = String(formData.get("websiteDomainRegistrarPassword") ?? "").trim().slice(0, 400);
  const clearVault = formData.get("clearDomainRegistrarVault") === "1";

  const websiteClientDomainNorm = strippedDomain ? normalizeClientWebsiteDomain(domainRaw) : null;
  if (strippedDomain && !websiteClientDomainNorm) {
    return portalFlashErr("Enter a valid domain (e.g. example.co.uk).");
  }

  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: { websiteDomainAccessEncrypted: true },
  });
  const existing = decryptWebsiteDomainVaultPayload(row?.websiteDomainAccessEncrypted);

  let websiteDomainAccessEncrypted: string | null = row?.websiteDomainAccessEncrypted?.trim() ?? null;
  let websiteDomainRegistrarVaultStored = Boolean(websiteDomainAccessEncrypted);

  if (clearVault) {
    websiteDomainAccessEncrypted = null;
    websiteDomainRegistrarVaultStored = false;
  } else {
    const login = loginInput || existing?.login || "";
    const password = passwordInput || existing?.password || "";
    const next = encryptWebsiteDomainVaultPayload({ login, password });
    if (next) {
      websiteDomainAccessEncrypted = next;
      websiteDomainRegistrarVaultStored = true;
    } else if (!login && !password) {
      websiteDomainAccessEncrypted = null;
      websiteDomainRegistrarVaultStored = false;
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      websiteClientDomain: websiteClientDomainNorm,
      websiteDomainProvider: provider || null,
      websiteDomainAccessEncrypted,
      websiteDomainRegistrarVaultStored,
    },
  });

  await revalidateProject(projectId);
  return portalFlashOk("Launch details saved ✓");
}

export async function setWebsiteLiveUrl(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) {
    return portalFlashErr("Couldn’t save URL. Try again.");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return portalFlashErr("Couldn’t save URL. Try again.");
  }
  const raw = String(formData.get("websiteLiveUrl") ?? "").trim();
  let websiteLiveUrl: string | null = null;
  if (raw) {
    try {
      const u = new URL(raw);
      if (u.protocol === "http:" || u.protocol === "https:") websiteLiveUrl = raw;
    } catch {
      websiteLiveUrl = null;
    }
  }
  if (raw && !websiteLiveUrl) {
    return portalFlashErr("Enter a valid http or https URL.");
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { websiteLiveUrl },
  });
  if (websiteLiveUrl) await notifyClientWebsiteLive(projectId, websiteLiveUrl);
  await revalidateProject(projectId);
  return portalFlashOk("Live URL saved ✓");
}

/** Step 1 only (brief, brand kit panel, inspiration). Planning + vault live on `/social/planning`. */
export async function saveSocialOnboarding(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email) || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("You don’t have permission to save this brief.");
  }
  if (!clientMayUseSocialPortal(project.portalKind)) {
    return portalFlashErr("Social onboarding isn’t available for this project.");
  }

  const prev = parseSocialOnboardingJson(project.socialOnboardingJson);

  const businessOverview = String(formData.get("businessOverview") ?? "").trim();
  const targetAudience = String(formData.get("targetAudience") ?? "").trim();
  const visualStyle = String(formData.get("visualStyle") ?? "").trim();
  const inspiringAccounts = String(formData.get("inspiringAccounts") ?? "").trim();
  const existingBrandKit = String(formData.get("existingBrandKit") ?? "").trim();
  const brandingPackageNeeded = formData.get("brandingPackageNeeded") === "1";
  const extraNotes = String(formData.get("extraNotes") ?? "").trim();
  if (!businessOverview || !targetAudience || !visualStyle || !inspiringAccounts) {
    return portalFlashErr("Please complete all required fields in the brief (marked with *).");
  }

  const kit = ["yes", "partial", "no"].includes(existingBrandKit) ? existingBrandKit : "";
  const json = JSON.stringify({
    businessOverview,
    targetAudience,
    visualStyle,
    inspiringAccounts,
    existingBrandKit: kit,
    brandingPackageNeeded,
    extraNotes,
    postIdeas: prev.postIdeas,
    dealsPromos: prev.dealsPromos,
    keyDates: prev.keyDates,
    needPlanningHelp: prev.needPlanningHelp,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      socialOnboardingJson: json,
      socialOnboardingSubmittedAt: new Date(),
    },
  });
  await notifySocialOnboardingSubmitted(projectId, project.name);
  await revalidateProject(projectId);
  return portalFlashOk("Brief and assets saved.");
}

/** Step 2 — content planning + optional social account vault (separate page). */
export async function saveSocialContentPlanning(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email) || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("You don’t have permission to save planning.");
  }
  if (!clientMayUseSocialPortal(project.portalKind)) {
    return portalFlashErr("Content planning isn’t available for this project.");
  }

  const prev = parseSocialOnboardingJson(project.socialOnboardingJson);
  const socialOnly = normalizePortalKind(project.portalKind) === "SOCIAL";
  if (
    socialOnly &&
    (!prev.businessOverview.trim() ||
      !prev.targetAudience.trim() ||
      !prev.visualStyle.trim() ||
      !prev.inspiringAccounts.trim())
  ) {
    return portalFlashErr("Complete Step 1 (brief & brand assets) on the social page before saving planning.");
  }

  const postIdeas = String(formData.get("postIdeas") ?? "").trim();
  const dealsPromos = String(formData.get("dealsPromos") ?? "").trim();
  const keyDates = String(formData.get("keyDates") ?? "").trim();
  const needPlanningHelp = formData.get("needPlanningHelp") === "1";
  const clearSocialVault = formData.get("clearSocialAccountAccess") === "1";
  const socialAccountAccessNotes = String(formData.get("socialAccountAccessNotes") ?? "");
  if (socialAccountAccessNotes.length > 12000) {
    return portalFlashErr("Account access notes are too long (max 12,000 characters).");
  }

  const json = JSON.stringify({
    businessOverview: prev.businessOverview,
    targetAudience: prev.targetAudience,
    visualStyle: prev.visualStyle,
    inspiringAccounts: prev.inspiringAccounts,
    existingBrandKit: prev.existingBrandKit,
    brandingPackageNeeded: prev.brandingPackageNeeded,
    extraNotes: prev.extraNotes,
    postIdeas,
    dealsPromos,
    keyDates,
    needPlanningHelp,
  });

  const existingVault = await prisma.project.findUnique({
    where: { id: projectId },
    select: { socialAccountAccessEncrypted: true },
  });

  let socialAccountAccessEncrypted: string | null;
  if (clearSocialVault) {
    socialAccountAccessEncrypted = null;
  } else if (socialAccountAccessNotes.trim()) {
    socialAccountAccessEncrypted = encryptSocialAccountAccessPlaintext(socialAccountAccessNotes);
  } else {
    socialAccountAccessEncrypted = existingVault?.socialAccountAccessEncrypted ?? null;
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      socialOnboardingJson: json,
      socialOnboardingSubmittedAt: new Date(),
      socialAccountAccessEncrypted,
    },
  });
  await notifySocialOnboardingSubmitted(projectId, project.name);
  await revalidateProject(projectId);
  return portalFlashOk("Planning saved.");
}

export async function saveCalendarItemFeedback(
  projectId: string,
  itemId: string,
  formData: FormData,
): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email) || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t send feedback. Try again.");
  }
  if (!clientMayUseSocialPortal(project.portalKind)) {
    return portalFlashErr("Couldn’t send feedback. Try again.");
  }

  const notes = String(formData.get("clientFeedback") ?? "").trim();
  if (notes.length > 4000) {
    return portalFlashErr("Feedback is too long (max 4,000 characters).");
  }

  const item = await prisma.contentCalendarItem.findFirst({
    where: { id: itemId, projectId },
  });
  if (!item) {
    return portalFlashErr("Couldn’t send feedback. Try again.");
  }

  if (
    item.postWorkflowStatus === "APPROVED" ||
    (item.clientSignedOff &&
      item.postWorkflowStatus !== "PENDING_APPROVAL" &&
      item.postWorkflowStatus !== "REVISION_NEEDED")
  ) {
    return portalFlashErr("Feedback can’t be added to this post in its current state.");
  }

  const action = String(formData.get("feedbackAction") ?? "revision").trim();

  if (action === "comment") {
    if (!notes) {
      return portalFlashErr("Add a comment before sending.");
    }
    const log = appendCalendarActivityLog(item.calendarActivityLogJson, {
      kind: "client_comment",
      summary: notes,
    });
    await prisma.contentCalendarItem.update({
      where: { id: itemId },
      data: { calendarActivityLogJson: log },
    });
    const postLabel =
      (item.title?.trim() || item.caption?.trim() || "").slice(0, 120) || "Calendar post";
    await notifyStudioTeamCalendarClientComment(projectId, project.name, itemId, postLabel, notes);
    await revalidateProject(projectId);
    return portalFlashOk("Comment sent ✓");
  }

  if (!notes) {
    return portalFlashErr("Describe what you’d like changed before sending.");
  }

  const log = appendCalendarActivityLog(item.calendarActivityLogJson, {
    kind: "client_revision_request",
    summary: notes,
  });

  await prisma.contentCalendarItem.update({
    where: { id: itemId },
    data: {
      clientFeedback: notes,
      clientSignedOff: false,
      signedOffAt: null,
      postWorkflowStatus: "REVISION_NEEDED",
      calendarActivityLogJson: log,
    },
  });
  const postLabel =
    (item.title?.trim() || item.caption?.trim() || "").slice(0, 120) || "Calendar post";
  await notifyStudioTeamCalendarFeedback(projectId, project.name, itemId, postLabel, notes);
  await revalidateProject(projectId);
  return portalFlashOk("Changes requested ✓");
}

/** Studio: allow client to review an approved post again (e.g. after scheduling issue). */
export async function reopenCalendarPostForClientReview(projectId: string, itemId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email)) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  const sm = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  if (!studioMayAccessProjectSocialCalendar(project, session.user.id, sm?.personaSlug ?? null)) return;

  const item = await prisma.contentCalendarItem.findFirst({
    where: { id: itemId, projectId },
  });
  if (!item || item.postWorkflowStatus !== "APPROVED") return;

  const log = appendCalendarActivityLog(item.calendarActivityLogJson, {
    kind: "studio_edit",
    summary: "Studio reopened this post for client review",
  });

  await prisma.contentCalendarItem.update({
    where: { id: itemId },
    data: {
      postWorkflowStatus: "PENDING_APPROVAL",
      clientSignedOff: false,
      signedOffAt: null,
      calendarActivityLogJson: log,
    },
  });
  await revalidateProject(projectId);
}

/** Studio: delete a calendar post (notifies client if they could see it). */
export async function deleteContentCalendarItem(projectId: string, itemId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email)) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  const sm = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  if (!studioMayAccessProjectSocialCalendar(project, session.user.id, sm?.personaSlug ?? null)) return;

  const item = await prisma.contentCalendarItem.findFirst({
    where: { id: itemId, projectId },
  });
  if (!item) return;

  const clientVisible = ["PENDING_APPROVAL", "APPROVED", "REVISION_NEEDED"].includes(item.postWorkflowStatus);
  const label = (item.title?.trim() || item.caption?.trim() || "Post").slice(0, 160);
  const scheduledIso = item.scheduledFor?.toISOString() ?? null;
  const channelsJson = item.channelsJson;

  await prisma.contentCalendarItem.delete({ where: { id: itemId } });

  if (clientVisible) {
    await notifyClientCalendarPostRemoved(projectId, label, scheduledIso, channelsJson);
  }
  await revalidateProject(projectId);
}

export async function saveProjectQuote(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) {
    return portalFlashErr("Save failed - try again");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || !quoteAllowedForProject(project)) {
    return portalFlashErr("Save failed - try again");
  }

  const intro = String(formData.get("intro") ?? "").trim();
  const lineItemsJson = String(formData.get("lineItemsJson") ?? "").trim();
  const lines = parseQuoteLineItemsJson(lineItemsJson);
  const normalized = JSON.stringify(lines);

  await prisma.projectQuote.upsert({
    where: { projectId },
    create: { projectId, intro: intro.slice(0, 4000), lineItemsJson: normalized },
    update: { intro: intro.slice(0, 4000), lineItemsJson: normalized },
  });
  await revalidateProject(projectId);
  return portalFlashOk("Quote saved ✓");
}

export async function sendProjectQuote(projectId: string, _formData?: FormData): Promise<PortalFormFlash> {
  void _formData;
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) {
    return portalFlashErr("Failed to send - try again");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || !quoteAllowedForProject(project)) {
    return portalFlashErr("Failed to send - try again");
  }

  const q = await prisma.projectQuote.findUnique({ where: { projectId } });
  if (!q) {
    return portalFlashErr("Failed to send - try again");
  }
  const lines = parseQuoteLineItemsJson(q.lineItemsJson);
  if (lines.length === 0) {
    return portalFlashErr("Failed to send - try again");
  }

  await prisma.projectQuote.update({
    where: { projectId },
    data: { sentAt: new Date() },
  });
  await notifyClientQuoteSent(projectId);
  await revalidateProject(projectId);
  return portalFlashOk("Quote sent ✓");
}

export async function saveProjectInspirationLinks(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) {
    return portalFlashErr("Studio users manage links from the project tools.");
  }
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("You don’t have permission to save inspiration links.");
  }

  const raw = String(formData.get("inspirationLinksJson") ?? "").trim();
  const links = parseInspirationLinksJson(raw);

  await prisma.project.update({
    where: { id: projectId },
    data: { inspirationLinksJson: JSON.stringify(links) },
  });
  await notifyInspirationLinksUpdated(projectId, project.name);
  await revalidateProject(projectId);
  return portalFlashOk("Inspiration links saved.");
}

function inspirationStepNotifyMeta(
  projectId: string,
  portalKind: string,
): { streamLabel: string; stepLabel: string; stepHref: string } {
  const k = normalizePortalKind(portalKind);
  if (k === "PRINT") {
    return {
      streamLabel: "Print",
      stepLabel: "Inspiration (optional)",
      stepHref: `/portal/project/${projectId}/print/inspiration`,
    };
  }
  if (k === "SIGNAGE") {
    return {
      streamLabel: "Signage",
      stepLabel: "Inspiration",
      stepHref: `/portal/project/${projectId}/signage/inspiration`,
    };
  }
  return {
    streamLabel: "Branding",
    stepLabel: "Inspiration & moodboard",
    stepHref: `/portal/project/${projectId}/branding/inspiration`,
  };
}

export async function saveBrandingMoodDescription(
  projectId: string,
  formData: FormData,
): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) {
    return portalFlashErr("Studio users update this from the project tools.");
  }
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("You don’t have permission to save notes.");
  }
  const vis = visiblePortalSections(project.portalKind);
  const k = normalizePortalKind(project.portalKind);
  if (!vis.branding && !vis.signage && k !== "PRINT") {
    return portalFlashErr("Written notes aren’t used for this project type.");
  }

  const wasComplete = clientInspirationStepSatisfied(project);
  const text = String(formData.get("moodDescription") ?? "").trim().slice(0, 12000);
  await prisma.project.update({
    where: { id: projectId },
    data: { brandingMoodDescription: text },
  });
  const next = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      brandingMoodDescription: true,
      inspirationLinksJson: true,
      name: true,
      portalKind: true,
      printInspirationSkipped: true,
    },
  });
  if (next && !wasComplete && clientInspirationStepSatisfied(next)) {
    const meta = inspirationStepNotifyMeta(projectId, next.portalKind);
    await notifyStudioWorkflowStepCompletedByClient({
      projectId,
      projectName: next.name,
      portalKind: next.portalKind,
      streamLabel: meta.streamLabel,
      stepLabel: meta.stepLabel,
      stepHref: meta.stepHref,
    });
  }
  await revalidateProject(projectId);
  return portalFlashOk("Notes saved.");
}

const MAX_BRAND_QUESTIONNAIRE_JSON = 140_000;

function clientMayEditBrandQuestionnaire(project: {
  brandingQuestionnaireSubmittedAt: Date | null;
  portalWorkflowReopenJson: string;
}): boolean {
  if (!project.brandingQuestionnaireSubmittedAt) return true;
  return isStepReopenedForClient("branding", "questionnaire", project.portalWorkflowReopenJson);
}

export async function saveBrandingQuestionnaireDraft(
  projectId: string,
  jsonPayload: string,
): Promise<{ ok: boolean }> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) return { ok: false };
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) return { ok: false };
  if (!visiblePortalSections(project.portalKind).branding) return { ok: false };
  if (!clientMayEditBrandQuestionnaire(project)) return { ok: false };
  if (jsonPayload.length > MAX_BRAND_QUESTIONNAIRE_JSON) return { ok: false };
  const parsed = parseBrandQuestionnaireJson(jsonPayload);
  await prisma.project.update({
    where: { id: projectId },
    data: { brandingQuestionnaireJson: stringifyBrandQuestionnaire(parsed) },
  });
  await revalidateProject(projectId);
  return { ok: true };
}

export type SubmitBrandQuestionnaireResult =
  | { ok: true }
  | { ok: false; issues: { section: number; label: string }[] };

export async function submitBrandingQuestionnaire(
  projectId: string,
  jsonPayload: string,
): Promise<SubmitBrandQuestionnaireResult> {
  const fail = (msg: string): SubmitBrandQuestionnaireResult => ({
    ok: false,
    issues: [{ section: 0, label: msg }],
  });
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) return fail("Only clients can submit this form.");
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) return fail("Check you’re signed in with full portal access.");
  if (!visiblePortalSections(project.portalKind).branding) return fail("This project doesn’t include branding.");
  if (!clientMayEditBrandQuestionnaire(project)) return fail("This questionnaire is locked. Ask the studio if you need changes.");
  if (jsonPayload.length > MAX_BRAND_QUESTIONNAIRE_JSON) return fail("Your answers are too long to save. Shorten a field and try again.");

  const data = parseBrandQuestionnaireJson(jsonPayload);
  const issues = validateBrandQuestionnaireForSubmit(data);
  if (issues.length > 0) return { ok: false, issues };

  const reopen = parseWorkflowReopenJson(project.portalWorkflowReopenJson);
  const wasReopenedForEdits = isStepReopenedForClient("branding", "questionnaire", project.portalWorkflowReopenJson);
  const brandingReopen = (reopen.branding ?? []).filter((s) => s !== "questionnaire");
  const nextReopen = { ...reopen, branding: brandingReopen };

  await prisma.project.update({
    where: { id: projectId },
    data: {
      brandingQuestionnaireJson: stringifyBrandQuestionnaire(data),
      brandingQuestionnaireSubmittedAt: new Date(),
      portalWorkflowReopenJson: stringifyWorkflowReopenJson(nextReopen),
    },
  });

  if (!project.brandingQuestionnaireSubmittedAt || wasReopenedForEdits) {
    await notifyStudioBrandingQuestionnaireSubmitted({
      projectId,
      projectName: project.name,
      stepHref: `/portal/project/${projectId}/branding/questionnaire`,
    });
  }
  await revalidateProject(projectId);
  return { ok: true };
}

export async function uploadBrandQuestionnaireFile(
  projectId: string,
  formData: FormData,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) return { ok: false, error: "Not allowed" };
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) return { ok: false, error: "Not allowed" };
  if (!visiblePortalSections(project.portalKind).branding) return { ok: false, error: "Not allowed" };
  if (!clientMayEditBrandQuestionnaire(project)) return { ok: false, error: "Questionnaire is locked" };

  const slot = String(formData.get("slot") ?? "");
  if (slot !== "inspiration" && slot !== "existing") return { ok: false, error: "Invalid upload type" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a file first" };

  let uploadKind: "raster" | "pdf";
  if (slot === "inspiration") {
    const err = validateUploadExtension(file.name, "raster");
    if (err) return { ok: false, error: err };
    uploadKind = "raster";
  } else {
    const rasterOk = validateUploadExtension(file.name, "raster") === null;
    const pdfOk = validateUploadExtension(file.name, "pdf") === null;
    if (!rasterOk && !pdfOk) return { ok: false, error: "Use an image (JPG, PNG, WEBP) or a PDF." };
    uploadKind = rasterOk ? "raster" : "pdf";
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) return { ok: false, error: "File is too large (max 8MB)" };

  const data = parseBrandQuestionnaireJson(project.brandingQuestionnaireJson);
  if (slot === "inspiration" && data.visualInspirationImagePaths.length >= 5) {
    return { ok: false, error: "You can upload up to 5 inspiration images" };
  }
  if (slot === "existing" && data.existingAssetsFilePaths.length >= 10) {
    return { ok: false, error: "Too many files — remove one or contact the studio" };
  }

  let rel: string;
  try {
    rel = await saveProjectUpload(projectId, file.name, buf, uploadKind);
    if (slot === "inspiration") data.visualInspirationImagePaths.push(rel);
    else data.existingAssetsFilePaths.push(rel);

    await prisma.project.update({
      where: { id: projectId },
      data: { brandingQuestionnaireJson: stringifyBrandQuestionnaire(data) },
    });
    await revalidateProject(projectId);
  } catch (e) {
    console.error("[portal upload] uploadBrandQuestionnaireFile", e);
    return { ok: false, error: formatPortalUploadFailureForUser(e) };
  }
  return { ok: true, path: rel };
}

export async function removeBrandQuestionnaireFile(
  projectId: string,
  relativePath: string,
  slot: "inspiration" | "existing",
): Promise<{ ok: boolean }> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) return { ok: false };
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) return { ok: false };
  if (!visiblePortalSections(project.portalKind).branding) return { ok: false };
  if (!clientMayEditBrandQuestionnaire(project)) return { ok: false };

  const data = parseBrandQuestionnaireJson(project.brandingQuestionnaireJson);
  if (slot === "inspiration") {
    if (!data.visualInspirationImagePaths.includes(relativePath)) return { ok: false };
    await deleteUploadThingFileByStoredValue(relativePath);
    data.visualInspirationImagePaths = data.visualInspirationImagePaths.filter((p) => p !== relativePath);
  } else {
    if (!data.existingAssetsFilePaths.includes(relativePath)) return { ok: false };
    await deleteUploadThingFileByStoredValue(relativePath);
    data.existingAssetsFilePaths = data.existingAssetsFilePaths.filter((p) => p !== relativePath);
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { brandingQuestionnaireJson: stringifyBrandQuestionnaire(data) },
  });
  await revalidateProject(projectId);
  return { ok: true };
}

export async function acknowledgeBrandingFinalDeliverables(projectId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) return;
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) return;
  if (!visiblePortalSections(project.portalKind).branding) return;
  const was = Boolean(project.brandingFinalDeliverablesAcknowledgedAt);
  await prisma.project.update({
    where: { id: projectId },
    data: { brandingFinalDeliverablesAcknowledgedAt: new Date() },
  });
  if (!was) {
    await notifyStudioWorkflowStepCompletedByClient({
      projectId,
      projectName: project.name,
      portalKind: project.portalKind,
      streamLabel: "Branding",
      stepLabel: "Final files (receipt)",
      stepHref: `/portal/project/${projectId}/branding/final-files`,
    });
  }
  await revalidateProject(projectId);
}

export async function saveSignageSpecification(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) {
    return portalFlashErr("Couldn’t save specification. Try again.");
  }
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t save specification. Try again.");
  }
  if (!visiblePortalSections(project.portalKind).signage) {
    return portalFlashErr("Couldn’t save specification. Try again.");
  }
  const summary = String(formData.get("summary") ?? "").trim().slice(0, 8000);
  if (summary.length < 8) {
    return portalFlashErr("Add a short summary (at least 8 characters).");
  }
  const payload = {
    summary,
    dimensions: String(formData.get("dimensions") ?? "").trim().slice(0, 2000),
    material: String(formData.get("material") ?? "").trim().slice(0, 2000),
    installNotes: String(formData.get("installNotes") ?? "").trim().slice(0, 4000),
  };
  const was = Boolean(project.signageSpecificationSubmittedAt);
  await prisma.project.update({
    where: { id: projectId },
    data: {
      signageSpecificationJson: JSON.stringify(payload),
      signageSpecificationSubmittedAt: new Date(),
    },
  });
  if (!was) {
    await notifyStudioWorkflowStepCompletedByClient({
      projectId,
      projectName: project.name,
      portalKind: project.portalKind,
      streamLabel: "Signage",
      stepLabel: "Sign specification",
      stepHref: `/portal/project/${projectId}/signage/specification`,
    });
  }
  await revalidateProject(projectId);
  return portalFlashOk("Specification saved ✓");
}

export async function savePrintSpecification(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) {
    return portalFlashErr("Couldn’t save specification. Try again.");
  }
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) {
    return portalFlashErr("Couldn’t save specification. Try again.");
  }
  if (normalizePortalKind(project.portalKind) !== "PRINT") {
    return portalFlashErr("Couldn’t save specification. Try again.");
  }
  const summary = String(formData.get("summary") ?? "").trim().slice(0, 8000);
  if (summary.length < 8) {
    return portalFlashErr("Add a short summary (at least 8 characters).");
  }
  const payload = {
    summary,
    quantity: String(formData.get("quantity") ?? "").trim().slice(0, 500),
    stock: String(formData.get("stock") ?? "").trim().slice(0, 500),
    finishing: String(formData.get("finishing") ?? "").trim().slice(0, 2000),
  };
  const was = Boolean(project.printSpecificationSubmittedAt);
  await prisma.project.update({
    where: { id: projectId },
    data: {
      printSpecificationJson: JSON.stringify(payload),
      printSpecificationSubmittedAt: new Date(),
    },
  });
  if (!was) {
    await notifyStudioWorkflowStepCompletedByClient({
      projectId,
      projectName: project.name,
      portalKind: project.portalKind,
      streamLabel: "Print",
      stepLabel: "Print specification",
      stepHref: `/portal/project/${projectId}/print/specification`,
    });
  }
  await revalidateProject(projectId);
  return portalFlashOk("Specification saved ✓");
}

export async function skipPrintInspirationStep(projectId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) return;
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) return;
  if (normalizePortalKind(project.portalKind) !== "PRINT") return;
  await prisma.project.update({
    where: { id: projectId },
    data: { printInspirationSkipped: true },
  });
  await revalidateProject(projectId);
}

export async function acknowledgeSignageFinalDeliverables(projectId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) return;
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) return;
  if (!visiblePortalSections(project.portalKind).signage) return;
  const was = Boolean(project.signageFinalDeliverablesAcknowledgedAt);
  await prisma.project.update({
    where: { id: projectId },
    data: { signageFinalDeliverablesAcknowledgedAt: new Date() },
  });
  if (!was) {
    await notifyStudioWorkflowStepCompletedByClient({
      projectId,
      projectName: project.name,
      portalKind: project.portalKind,
      streamLabel: "Signage",
      stepLabel: "Final files & order",
      stepHref: `/portal/project/${projectId}/signage/final-files`,
    });
  }
  await revalidateProject(projectId);
}

export async function acknowledgePrintFinalDeliverables(projectId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (isStudioUser(session?.user?.email)) return;
  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project)) return;
  if (normalizePortalKind(project.portalKind) !== "PRINT") return;
  const was = Boolean(project.printFinalDeliverablesAcknowledgedAt);
  await prisma.project.update({
    where: { id: projectId },
    data: { printFinalDeliverablesAcknowledgedAt: new Date() },
  });
  if (!was) {
    await notifyStudioWorkflowStepCompletedByClient({
      projectId,
      projectName: project.name,
      portalKind: project.portalKind,
      streamLabel: "Print",
      stepLabel: "Final files & order",
      stepHref: `/portal/project/${projectId}/print/final-files`,
    });
  }
  await revalidateProject(projectId);
}

export async function markProjectComplete(projectId: string, _formData: FormData): Promise<PortalFormFlash> {
  void _formData;
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) {
    return portalFlashErr("Couldn’t mark project complete. Try again.");
  }
  if (!(await sessionStudioPersonaIsIssy())) {
    return portalFlashErr("Couldn’t mark project complete. Try again.");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return portalFlashErr("Couldn’t mark project complete. Try again.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { studioMarkedCompleteAt: new Date() },
  });
  await upsertUserBrandKitFromBrandingProject(projectId);
  await notifyClientProjectWrappedUp(projectId);
  await revalidateProject(projectId);
  return portalFlashOk("Project marked complete ✓");
}

export async function submitOffboardingReview(projectId: string, formData: FormData): Promise<PortalFormFlash> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || isStudioUser(session.user.email)) {
    return portalFlashErr("Couldn’t submit feedback. Try again.");
  }

  const project = await getProjectForSession(projectId, session);
  if (!project || !clientHasFullPortalAccess(project) || !project.studioMarkedCompleteAt) {
    return portalFlashErr("Couldn’t submit feedback. Try again.");
  }

  const existing = await prisma.publishedClientReview.findUnique({ where: { projectId } });
  if (existing) {
    return portalFlashErr("You’ve already submitted feedback for this project.");
  }

  const answers = parseOffboardingAnswersFromFormData(formData);
  if (!answers) {
    return portalFlashErr("Please complete the form before submitting.");
  }

  const reviewText = offboardingHighlightAnswer(answers);
  if (!reviewText || reviewText.length > 8000) {
    return portalFlashErr("Review text is missing or too long.");
  }

  const ratingRaw = Number(formData.get("rating"));
  const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(1, Math.round(ratingRaw))) : 0;
  const reviewerName = String(formData.get("reviewerName") ?? "").trim();

  if (rating < 1) {
    return portalFlashErr("Please choose a star rating.");
  }

  const name =
    reviewerName.slice(0, 200) ||
    project.user?.name?.trim() ||
    project.user?.businessName?.trim() ||
    "Client";

  const featuredOnHome = rating === 5;

  await prisma.publishedClientReview.create({
    data: {
      projectId,
      reviewerName: name,
      reviewText,
      rating,
      offboardingAnswersJson: JSON.stringify(answers),
      featuredOnHome,
    },
  });
  await notifyOffboardingReviewSubmitted(projectId, project.name);
  await revalidateProject(projectId);
  revalidatePath("/");
  return portalFlashOk("Thank you — feedback submitted ✓");
}

export async function approveFaqSuggestion(suggestionId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) return;

  const s = await prisma.faqSuggestion.findUnique({ where: { id: suggestionId } });
  if (!s || s.status !== "PENDING") return;

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer || question.length > 500 || answer.length > 4000) return;

  await prisma.$transaction([
    prisma.siteFaq.create({
      data: { question, answer, sortOrder: 100 },
    }),
    prisma.faqSuggestion.update({
      where: { id: suggestionId },
      data: { status: "APPROVED" },
    }),
  ]);
  revalidatePath("/about");
}

export async function rejectFaqSuggestion(suggestionId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!isStudioUser(session?.user?.email)) return;

  const s = await prisma.faqSuggestion.findUnique({ where: { id: suggestionId } });
  if (!s || s.status !== "PENDING") return;

  await prisma.faqSuggestion.update({
    where: { id: suggestionId },
    data: { status: "REJECTED" },
  });
  revalidatePath("/portal/faq-suggestions");
}

export async function markClientNotificationRead(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || isStudioUser(session.user.email)) return;
  const row = await prisma.clientNotification.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!row) return;
  await prisma.clientNotification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  revalidatePath("/portal");
  revalidatePath("/portal/notifications");
}

export async function markAllClientNotificationsRead(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || isStudioUser(session.user.email)) return;
  await prisma.clientNotification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/portal");
  revalidatePath("/portal/notifications");
}
