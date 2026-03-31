-- =============================================================================
-- Collectiv Studio — full database schema + indexes + FKs + RLS
-- Generated from prisma/schema.prisma, prisma/migrations/*_init/migration.sql,
-- and prisma/supabase-rls.sql
--
-- Idempotent: CREATE TABLE / CREATE INDEX use IF NOT EXISTS; FKs skip if present;
-- RLS + policies run only for tables that exist (safe for partial schemas).
-- Note: IF NOT EXISTS on tables does not add missing columns to an existing table;
--       use Prisma migrations or manual ALTER for drift.
-- This schema defines no custom ENUM/domain types — no CREATE TYPE clauses to emit.
--
-- Prisma (postgres / service_role) bypasses RLS. PostgREST `authenticated`
-- users are restricted by the policies below (JWT email matched to "User".email).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tables (order respects foreign keys)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetTokenExpiresAt" TIMESTAMP(3),
    "clientInviteToken" TEXT,
    "clientInviteExpiresAt" TIMESTAMP(3),
    "clientInviteSentAt" TIMESTAMP(3),
    "clientRegisteredAt" TIMESTAMP(3),
    "businessName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profilePhotoPath" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "invitedClientEmail" TEXT,
    "name" TEXT NOT NULL,
    "portalKind" TEXT NOT NULL DEFAULT 'MULTI',
    "clientVerifiedAt" TIMESTAMP(3),
    "clientContractSignedAt" TIMESTAMP(3),
    "contractTermsText" TEXT NOT NULL DEFAULT '',
    "contractSignedTypedName" TEXT,
    "contractSignedIp" TEXT,
    "contractSignedSnapshotText" TEXT,
    "studioDepositMarkedPaidAt" TIMESTAMP(3),
    "discoveryApprovedAt" TIMESTAMP(3),
    "studioReviewedStepsJson" TEXT NOT NULL DEFAULT '{}',
    "studioWebsiteLiveConfirmedAt" TIMESTAMP(3),
    "websitePrimaryHex" TEXT,
    "websiteSecondaryHex" TEXT,
    "websiteAccentHex" TEXT,
    "websiteQuaternaryHex" TEXT,
    "websiteFontPaths" TEXT NOT NULL DEFAULT '[]',
    "websiteLogoPath" TEXT,
    "websiteLogoVariationsJson" TEXT NOT NULL DEFAULT '[]',
    "websiteKitSignedOff" BOOLEAN NOT NULL DEFAULT false,
    "websiteContentSignedOff" BOOLEAN NOT NULL DEFAULT false,
    "websitePreviewSignedOff" BOOLEAN NOT NULL DEFAULT false,
    "websiteLaunchSignedOff" BOOLEAN NOT NULL DEFAULT false,
    "websiteKitPreviewToken" TEXT,
    "websitePageCount" INTEGER NOT NULL DEFAULT 4,
    "websitePageLabels" TEXT NOT NULL DEFAULT '["Home","About","Services","Contact"]',
    "websiteLiveUrl" TEXT,
    "websiteClientDomain" TEXT,
    "websiteDomainProvider" TEXT,
    "websiteDomainAccessEncrypted" TEXT,
    "websiteDomainRegistrarVaultStored" BOOLEAN NOT NULL DEFAULT false,
    "socialOnboardingJson" TEXT NOT NULL DEFAULT '{}',
    "socialOnboardingSubmittedAt" TIMESTAMP(3),
    "socialAccountAccessEncrypted" TEXT,
    "socialWeeklyScheduleJson" TEXT NOT NULL DEFAULT '[]',
    "socialPlaceholdersGeneratedThroughYm" TEXT NOT NULL DEFAULT '',
    "socialMayFillReminderSentYm" TEXT NOT NULL DEFAULT '',
    "studioMarkedCompleteAt" TIMESTAMP(3),
    "inspirationLinksJson" TEXT NOT NULL DEFAULT '[]',
    "brandingMoodDescription" TEXT NOT NULL DEFAULT '',
    "brandingQuestionnaireJson" TEXT NOT NULL DEFAULT '{}',
    "brandingQuestionnaireSubmittedAt" TIMESTAMP(3),
    "signageSpecificationJson" TEXT NOT NULL DEFAULT '{}',
    "signageSpecificationSubmittedAt" TIMESTAMP(3),
    "printSpecificationJson" TEXT NOT NULL DEFAULT '{}',
    "printSpecificationSubmittedAt" TIMESTAMP(3),
    "printInspirationSkipped" BOOLEAN NOT NULL DEFAULT false,
    "websitePreviewClientFeedback" TEXT NOT NULL DEFAULT '',
    "portalWorkflowReopenJson" TEXT NOT NULL DEFAULT '{}',
    "brandingFinalDeliverablesAcknowledgedAt" TIMESTAMP(3),
    "signageFinalDeliverablesAcknowledgedAt" TIMESTAMP(3),
    "printFinalDeliverablesAcknowledgedAt" TIMESTAMP(3),
    "paymentStatus" TEXT NOT NULL DEFAULT 'CURRENT',
    "paymentNoteForClient" TEXT NOT NULL DEFAULT '',
    "clientAcknowledgedFinalPaymentAt" TIMESTAMP(3),
    "assignedStudioUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProjectInternalNote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectInternalNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserBrandKit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websitePrimaryHex" TEXT,
    "websiteSecondaryHex" TEXT,
    "websiteAccentHex" TEXT,
    "websiteQuaternaryHex" TEXT,
    "websiteFontPaths" TEXT NOT NULL DEFAULT '[]',
    "websiteLogoPath" TEXT,
    "websiteLogoVariationsJson" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBrandKit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClientNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudioTeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personaSlug" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "availabilityNote" TEXT NOT NULL DEFAULT '',
    "welcomeName" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioTeamMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudioTeamChatMessage" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mentionedUserIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioTeamChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudioNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudioAgencyInboxDismissal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "calendarItemId" TEXT NOT NULL DEFAULT '',
    "anchorProjectMessageId" TEXT,
    "anchorCalendarUpdatedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioAgencyInboxDismissal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AgencyTodo" (
    "id" TEXT NOT NULL,
    "assigneeUserId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "kind" TEXT NOT NULL DEFAULT 'manual',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "autoSnoozedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyTodo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudioTimeOff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioTimeOff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProjectQuote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "intro" TEXT NOT NULL DEFAULT '',
    "lineItemsJson" TEXT NOT NULL DEFAULT '[]',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectQuote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PublishedClientReview" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "offboardingAnswersJson" TEXT NOT NULL DEFAULT '[]',
    "featuredOnHome" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishedClientReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ChatQuestionStat" (
    "id" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "sampleQuestion" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatQuestionStat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FaqSuggestion" (
    "id" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "sampleQuestion" TEXT NOT NULL,
    "askCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SiteFaq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteFaq_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WebsitePageBrief" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "pageIndex" INTEGER NOT NULL,
    "headline" TEXT,
    "bodyCopy" TEXT NOT NULL DEFAULT '',
    "imagePaths" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsitePageBrief_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContentCalendarItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "title" TEXT,
    "imagePath" TEXT,
    "caption" TEXT NOT NULL DEFAULT '',
    "hashtags" TEXT NOT NULL DEFAULT '',
    "channelsJson" TEXT NOT NULL DEFAULT '["instagram"]',
    "clientFeedback" TEXT,
    "clientSignedOff" BOOLEAN NOT NULL DEFAULT false,
    "signedOffAt" TIMESTAMP(3),
    "postWorkflowStatus" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "isPlanPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "postFormat" TEXT NOT NULL DEFAULT 'GRAPHIC',
    "planMonthKey" TEXT,
    "planStableKey" TEXT,
    "calendarActivityLogJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentCalendarItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReviewAsset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "filePath" TEXT,
    "clientSignedOff" BOOLEAN NOT NULL DEFAULT false,
    "signedOffAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProjectMessage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorUserId" TEXT,

    CONSTRAINT "ProjectMessage_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- 2. Indexes (unique + secondary)
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_passwordResetToken_key" ON "User"("passwordResetToken");
CREATE UNIQUE INDEX IF NOT EXISTS "User_clientInviteToken_key" ON "User"("clientInviteToken");
CREATE UNIQUE INDEX IF NOT EXISTS "Project_websiteKitPreviewToken_key" ON "Project"("websiteKitPreviewToken");
CREATE INDEX IF NOT EXISTS "Project_invitedClientEmail_idx" ON "Project"("invitedClientEmail");
CREATE INDEX IF NOT EXISTS "ProjectInternalNote_projectId_createdAt_idx" ON "ProjectInternalNote"("projectId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "UserBrandKit_userId_key" ON "UserBrandKit"("userId");
CREATE INDEX IF NOT EXISTS "ClientNotification_userId_readAt_createdAt_idx" ON "ClientNotification"("userId", "readAt", "createdAt");
CREATE INDEX IF NOT EXISTS "ClientNotification_userId_createdAt_idx" ON "ClientNotification"("userId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "StudioTeamMember_userId_key" ON "StudioTeamMember"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "StudioTeamMember_personaSlug_key" ON "StudioTeamMember"("personaSlug");
CREATE INDEX IF NOT EXISTS "StudioTeamChatMessage_createdAt_idx" ON "StudioTeamChatMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "StudioNotification_userId_readAt_createdAt_idx" ON "StudioNotification"("userId", "readAt", "createdAt");
CREATE INDEX IF NOT EXISTS "StudioAgencyInboxDismissal_userId_kind_idx" ON "StudioAgencyInboxDismissal"("userId", "kind");
CREATE UNIQUE INDEX IF NOT EXISTS "StudioAgencyInboxDismissal_userId_kind_projectId_calendarIt_key" ON "StudioAgencyInboxDismissal"("userId", "kind", "projectId", "calendarItemId");
CREATE INDEX IF NOT EXISTS "AgencyTodo_assigneeUserId_completedAt_idx" ON "AgencyTodo"("assigneeUserId", "completedAt");
CREATE INDEX IF NOT EXISTS "StudioTimeOff_userId_idx" ON "StudioTimeOff"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectQuote_projectId_key" ON "ProjectQuote"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "PublishedClientReview_projectId_key" ON "PublishedClientReview"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "ChatQuestionStat_normalizedKey_key" ON "ChatQuestionStat"("normalizedKey");
CREATE UNIQUE INDEX IF NOT EXISTS "FaqSuggestion_normalizedKey_key" ON "FaqSuggestion"("normalizedKey");
CREATE UNIQUE INDEX IF NOT EXISTS "WebsitePageBrief_projectId_pageIndex_key" ON "WebsitePageBrief"("projectId", "pageIndex");
CREATE INDEX IF NOT EXISTS "ContentCalendarItem_projectId_planMonthKey_idx" ON "ContentCalendarItem"("projectId", "planMonthKey");
CREATE INDEX IF NOT EXISTS "ContentCalendarItem_projectId_planStableKey_idx" ON "ContentCalendarItem"("projectId", "planStableKey");
CREATE INDEX IF NOT EXISTS "ProjectMessage_authorUserId_idx" ON "ProjectMessage"("authorUserId");

-- ---------------------------------------------------------------------------
-- 3. Foreign keys (skip if constraint or referenced objects already exist)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Project" ADD CONSTRAINT "Project_assignedStudioUserId_fkey" FOREIGN KEY ("assignedStudioUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ProjectInternalNote" ADD CONSTRAINT "ProjectInternalNote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ProjectInternalNote" ADD CONSTRAINT "ProjectInternalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "UserBrandKit" ADD CONSTRAINT "UserBrandKit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ClientNotification" ADD CONSTRAINT "ClientNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "StudioTeamMember" ADD CONSTRAINT "StudioTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "StudioTeamChatMessage" ADD CONSTRAINT "StudioTeamChatMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "StudioNotification" ADD CONSTRAINT "StudioNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "StudioAgencyInboxDismissal" ADD CONSTRAINT "StudioAgencyInboxDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "StudioAgencyInboxDismissal" ADD CONSTRAINT "StudioAgencyInboxDismissal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "AgencyTodo" ADD CONSTRAINT "AgencyTodo_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "AgencyTodo" ADD CONSTRAINT "AgencyTodo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "StudioTimeOff" ADD CONSTRAINT "StudioTimeOff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ProjectQuote" ADD CONSTRAINT "ProjectQuote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "PublishedClientReview" ADD CONSTRAINT "PublishedClientReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "WebsitePageBrief" ADD CONSTRAINT "WebsitePageBrief_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ContentCalendarItem" ADD CONSTRAINT "ContentCalendarItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ReviewAsset" ADD CONSTRAINT "ReviewAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ProjectMessage" ADD CONSTRAINT "ProjectMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ProjectMessage" ADD CONSTRAINT "ProjectMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4. RLS helper functions (SECURITY DEFINER — read User / StudioTeamMember)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.app_jwt_email()
RETURNS TEXT AS $$
  SELECT LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_current_user_id()
RETURNS TEXT AS $$
  SELECT u.id FROM "User" u
  WHERE LOWER(u.email) = public.app_jwt_email()
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_is_issy()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "User" u
    INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
    WHERE s."personaSlug" = 'isabella' AND LOWER(u.email) = public.app_jwt_email()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_is_harriet()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "User" u
    INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
    WHERE s."personaSlug" = 'harriet' AND LOWER(u.email) = public.app_jwt_email()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_is_may()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "User" u
    INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
    WHERE s."personaSlug" = 'may' AND LOWER(u.email) = public.app_jwt_email()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_harriet_user_id()
RETURNS TEXT AS $$
  SELECT u.id FROM "User" u
  INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
  WHERE s."personaSlug" = 'harriet' LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_may_user_id()
RETURNS TEXT AS $$
  SELECT u.id FROM "User" u
  INNER JOIN "StudioTeamMember" s ON s."userId" = u.id
  WHERE s."personaSlug" = 'may' LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_project_visible_studio(p_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "Project" p WHERE p.id = p_id AND (
      public.app_is_issy()
      OR (public.app_is_harriet() AND p."assignedStudioUserId" = public.app_harriet_user_id())
      OR (
        public.app_is_may()
        AND p."assignedStudioUserId" = public.app_may_user_id()
        AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_project_visible_client(p_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "Project" pr
    WHERE pr.id = p_id
      AND pr."userId" IS NOT NULL
      AND pr."userId" = public.app_current_user_id()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.app_project_visible(p_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT public.app_project_visible_client(p_id) OR public.app_project_visible_studio(p_id);
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security + policies
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'User', 'Project', 'ProjectInternalNote', 'UserBrandKit', 'ClientNotification',
    'StudioTeamMember', 'StudioTeamChatMessage', 'StudioNotification', 'StudioAgencyInboxDismissal',
    'AgencyTodo', 'StudioTimeOff', 'ProjectQuote', 'PublishedClientReview', 'ChatQuestionStat',
    'FaqSuggestion', 'SiteFaq', 'WebsitePageBrief', 'ContentCalendarItem', 'ReviewAsset', 'ProjectMessage'
  ]
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'User')) IS NOT NULL THEN
DROP POLICY IF EXISTS "user_self_or_issy" ON "User";
CREATE POLICY "user_self_or_issy" ON "User" FOR ALL TO authenticated
  USING (id = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK (id = public.app_current_user_id() OR public.app_is_issy());

DROP POLICY IF EXISTS "user_studio_harriet_may_read" ON "User";
CREATE POLICY "user_studio_harriet_may_read" ON "User" FOR SELECT TO authenticated
  USING (
    public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p."assignedStudioUserId" = public.app_harriet_user_id()
          AND (p."userId" = "User".id OR LOWER(p."invitedClientEmail") = LOWER("User".email))
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
          AND (p."userId" = "User".id OR LOWER(p."invitedClientEmail") = LOWER("User".email))
      )
    )
  );

DROP POLICY IF EXISTS "user_no_broad_write_harriet_may" ON "User";
CREATE POLICY "user_no_broad_write_harriet_may" ON "User" FOR UPDATE TO authenticated
  USING (public.app_is_issy() OR id = public.app_current_user_id())
  WITH CHECK (public.app_is_issy() OR id = public.app_current_user_id());

DROP POLICY IF EXISTS "user_insert_issy" ON "User";
CREATE POLICY "user_insert_issy" ON "User" FOR INSERT TO authenticated
  WITH CHECK (public.app_is_issy());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'Project')) IS NOT NULL THEN
DROP POLICY IF EXISTS "project_access" ON "Project";
CREATE POLICY "project_access" ON "Project" FOR ALL TO authenticated
  USING (
    ("userId" IS NOT NULL AND "userId" = public.app_current_user_id())
    OR public.app_is_issy()
    OR (public.app_is_harriet() AND "assignedStudioUserId" = public.app_harriet_user_id())
    OR (
      public.app_is_may()
      AND "assignedStudioUserId" = public.app_may_user_id()
      AND "portalKind" IN ('SOCIAL', 'MULTI')
    )
  )
  WITH CHECK (
    public.app_is_issy()
    OR ("userId" IS NOT NULL AND "userId" = public.app_current_user_id())
    OR (public.app_is_harriet() AND "assignedStudioUserId" = public.app_harriet_user_id())
    OR (
      public.app_is_may()
      AND "assignedStudioUserId" = public.app_may_user_id()
      AND "portalKind" IN ('SOCIAL', 'MULTI')
    )
  );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'UserBrandKit')) IS NOT NULL THEN
DROP POLICY IF EXISTS "ubk_self" ON "UserBrandKit";
CREATE POLICY "ubk_self" ON "UserBrandKit" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK ("userId" = public.app_current_user_id() OR public.app_is_issy());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'ClientNotification')) IS NOT NULL THEN
DROP POLICY IF EXISTS "cn_self" ON "ClientNotification";
CREATE POLICY "cn_self" ON "ClientNotification" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK ("userId" = public.app_current_user_id() OR public.app_is_issy());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'StudioTeamMember')) IS NOT NULL THEN
DROP POLICY IF EXISTS "stm_self_issy" ON "StudioTeamMember";
CREATE POLICY "stm_self_issy" ON "StudioTeamMember" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK (public.app_is_issy());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'StudioTeamChatMessage')) IS NOT NULL THEN
DROP POLICY IF EXISTS "stcm_studio" ON "StudioTeamChatMessage";
CREATE POLICY "stcm_studio" ON "StudioTeamChatMessage" FOR ALL TO authenticated
  USING (
    public.app_is_issy()
    OR public.app_is_harriet()
    OR public.app_is_may()
  )
  WITH CHECK (
    public.app_is_issy()
    OR public.app_is_harriet()
    OR public.app_is_may()
  );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'StudioNotification')) IS NOT NULL THEN
DROP POLICY IF EXISTS "sn_self_issy" ON "StudioNotification";
CREATE POLICY "sn_self_issy" ON "StudioNotification" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK ("userId" = public.app_current_user_id() OR public.app_is_issy());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'StudioAgencyInboxDismissal')) IS NOT NULL THEN
DROP POLICY IF EXISTS "said_studio" ON "StudioAgencyInboxDismissal";
CREATE POLICY "said_studio" ON "StudioAgencyInboxDismissal" FOR ALL TO authenticated
  USING (
    "userId" = public.app_current_user_id()
    OR public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId" AND p."assignedStudioUserId" = public.app_harriet_user_id()
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId"
          AND p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  )
  WITH CHECK (
    "userId" = public.app_current_user_id()
    OR public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId" AND p."assignedStudioUserId" = public.app_harriet_user_id()
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId"
          AND p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'AgencyTodo')) IS NOT NULL THEN
DROP POLICY IF EXISTS "at_studio" ON "AgencyTodo";
CREATE POLICY "at_studio" ON "AgencyTodo" FOR ALL TO authenticated
  USING (
    "assigneeUserId" = public.app_current_user_id()
    OR public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND "assigneeUserId" = public.app_harriet_user_id()
    )
    OR (
      public.app_is_may()
      AND "assigneeUserId" = public.app_may_user_id()
    )
  )
  WITH CHECK (
    public.app_is_issy()
    OR "assigneeUserId" = public.app_current_user_id()
    OR (
      public.app_is_harriet()
      AND "assigneeUserId" = public.app_harriet_user_id()
    )
    OR (
      public.app_is_may()
      AND "assigneeUserId" = public.app_may_user_id()
    )
  );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'StudioTimeOff')) IS NOT NULL THEN
DROP POLICY IF EXISTS "sto_self" ON "StudioTimeOff";
CREATE POLICY "sto_self" ON "StudioTimeOff" FOR ALL TO authenticated
  USING ("userId" = public.app_current_user_id() OR public.app_is_issy())
  WITH CHECK ("userId" = public.app_current_user_id() OR public.app_is_issy());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'ProjectQuote')) IS NOT NULL THEN
DROP POLICY IF EXISTS "pq_project" ON "ProjectQuote";
CREATE POLICY "pq_project" ON "ProjectQuote" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'PublishedClientReview')) IS NOT NULL THEN
DROP POLICY IF EXISTS "pcr_project" ON "PublishedClientReview";
CREATE POLICY "pcr_project" ON "PublishedClientReview" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'WebsitePageBrief')) IS NOT NULL THEN
DROP POLICY IF EXISTS "wpb_project" ON "WebsitePageBrief";
CREATE POLICY "wpb_project" ON "WebsitePageBrief" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'ContentCalendarItem')) IS NOT NULL THEN
DROP POLICY IF EXISTS "cci_project" ON "ContentCalendarItem";
CREATE POLICY "cci_project" ON "ContentCalendarItem" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'ReviewAsset')) IS NOT NULL THEN
DROP POLICY IF EXISTS "ra_project" ON "ReviewAsset";
CREATE POLICY "ra_project" ON "ReviewAsset" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'ProjectMessage')) IS NOT NULL THEN
DROP POLICY IF EXISTS "pm_project" ON "ProjectMessage";
CREATE POLICY "pm_project" ON "ProjectMessage" FOR ALL TO authenticated
  USING (public.app_project_visible("projectId"))
  WITH CHECK (public.app_project_visible("projectId"));
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'ProjectInternalNote')) IS NOT NULL THEN
DROP POLICY IF EXISTS "pin_project" ON "ProjectInternalNote";
CREATE POLICY "pin_project" ON "ProjectInternalNote" FOR ALL TO authenticated
  USING (
    public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId" AND p."assignedStudioUserId" = public.app_harriet_user_id()
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId"
          AND p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  )
  WITH CHECK (
    public.app_is_issy()
    OR (
      public.app_is_harriet()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId" AND p."assignedStudioUserId" = public.app_harriet_user_id()
      )
    )
    OR (
      public.app_is_may()
      AND EXISTS (
        SELECT 1 FROM "Project" p
        WHERE p.id = "projectId"
          AND p."assignedStudioUserId" = public.app_may_user_id()
          AND p."portalKind" IN ('SOCIAL', 'MULTI')
      )
    )
  );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'ChatQuestionStat')) IS NOT NULL THEN
DROP POLICY IF EXISTS "cqs_issy" ON "ChatQuestionStat";
CREATE POLICY "cqs_issy" ON "ChatQuestionStat" FOR ALL TO authenticated
  USING (public.app_is_issy())
  WITH CHECK (public.app_is_issy());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'FaqSuggestion')) IS NOT NULL THEN
DROP POLICY IF EXISTS "fs_issy" ON "FaqSuggestion";
CREATE POLICY "fs_issy" ON "FaqSuggestion" FOR ALL TO authenticated
  USING (public.app_is_issy())
  WITH CHECK (public.app_is_issy());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass(format('public.%I', 'SiteFaq')) IS NOT NULL THEN
DROP POLICY IF EXISTS "sf_public_read_issy_write" ON "SiteFaq";
CREATE POLICY "sf_public_read_issy_write" ON "SiteFaq" FOR SELECT TO authenticated
  USING (true);
DROP POLICY IF EXISTS "sf_issy_write" ON "SiteFaq";
CREATE POLICY "sf_issy_write" ON "SiteFaq" FOR INSERT TO authenticated
  WITH CHECK (public.app_is_issy());
DROP POLICY IF EXISTS "sf_issy_update" ON "SiteFaq";
CREATE POLICY "sf_issy_update" ON "SiteFaq" FOR UPDATE TO authenticated
  USING (public.app_is_issy())
  WITH CHECK (public.app_is_issy());
DROP POLICY IF EXISTS "sf_issy_delete" ON "SiteFaq";
CREATE POLICY "sf_issy_delete" ON "SiteFaq" FOR DELETE TO authenticated
  USING (public.app_is_issy());
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 6. Grants (Supabase API roles + RLS helpers)
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, postgres;

GRANT EXECUTE ON FUNCTION public.app_jwt_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_is_issy() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_is_harriet() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_is_may() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_harriet_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_may_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_project_visible_studio(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_project_visible_client(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_project_visible(TEXT) TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role, postgres;

-- =============================================================================
-- End. Optional: mark migration for Prisma — run locally when you can connect:
--   npx prisma migrate resolve --applied 20260330204635_init
-- =============================================================================
