-- CreateTable
CREATE TABLE "User" (
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

-- CreateTable
CREATE TABLE "Project" (
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

-- CreateTable
CREATE TABLE "ProjectInternalNote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectInternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBrandKit" (
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

-- CreateTable
CREATE TABLE "ClientNotification" (
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

-- CreateTable
CREATE TABLE "StudioTeamMember" (
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

-- CreateTable
CREATE TABLE "StudioTeamChatMessage" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mentionedUserIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioTeamChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioNotification" (
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

-- CreateTable
CREATE TABLE "StudioAgencyInboxDismissal" (
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

-- CreateTable
CREATE TABLE "AgencyTodo" (
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

-- CreateTable
CREATE TABLE "StudioTimeOff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioTimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectQuote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "intro" TEXT NOT NULL DEFAULT '',
    "lineItemsJson" TEXT NOT NULL DEFAULT '[]',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishedClientReview" (
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

-- CreateTable
CREATE TABLE "ChatQuestionStat" (
    "id" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "sampleQuestion" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatQuestionStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqSuggestion" (
    "id" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "sampleQuestion" TEXT NOT NULL,
    "askCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteFaq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsitePageBrief" (
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

-- CreateTable
CREATE TABLE "ContentCalendarItem" (
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

-- CreateTable
CREATE TABLE "ReviewAsset" (
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

-- CreateTable
CREATE TABLE "ProjectMessage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorUserId" TEXT,

    CONSTRAINT "ProjectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_clientInviteToken_key" ON "User"("clientInviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "Project_websiteKitPreviewToken_key" ON "Project"("websiteKitPreviewToken");

-- CreateIndex
CREATE INDEX "Project_invitedClientEmail_idx" ON "Project"("invitedClientEmail");

-- CreateIndex
CREATE INDEX "ProjectInternalNote_projectId_createdAt_idx" ON "ProjectInternalNote"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBrandKit_userId_key" ON "UserBrandKit"("userId");

-- CreateIndex
CREATE INDEX "ClientNotification_userId_readAt_createdAt_idx" ON "ClientNotification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "ClientNotification_userId_createdAt_idx" ON "ClientNotification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudioTeamMember_userId_key" ON "StudioTeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioTeamMember_personaSlug_key" ON "StudioTeamMember"("personaSlug");

-- CreateIndex
CREATE INDEX "StudioTeamChatMessage_createdAt_idx" ON "StudioTeamChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "StudioNotification_userId_readAt_createdAt_idx" ON "StudioNotification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "StudioAgencyInboxDismissal_userId_kind_idx" ON "StudioAgencyInboxDismissal"("userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "StudioAgencyInboxDismissal_userId_kind_projectId_calendarIt_key" ON "StudioAgencyInboxDismissal"("userId", "kind", "projectId", "calendarItemId");

-- CreateIndex
CREATE INDEX "AgencyTodo_assigneeUserId_completedAt_idx" ON "AgencyTodo"("assigneeUserId", "completedAt");

-- CreateIndex
CREATE INDEX "StudioTimeOff_userId_idx" ON "StudioTimeOff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectQuote_projectId_key" ON "ProjectQuote"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishedClientReview_projectId_key" ON "PublishedClientReview"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatQuestionStat_normalizedKey_key" ON "ChatQuestionStat"("normalizedKey");

-- CreateIndex
CREATE UNIQUE INDEX "FaqSuggestion_normalizedKey_key" ON "FaqSuggestion"("normalizedKey");

-- CreateIndex
CREATE UNIQUE INDEX "WebsitePageBrief_projectId_pageIndex_key" ON "WebsitePageBrief"("projectId", "pageIndex");

-- CreateIndex
CREATE INDEX "ContentCalendarItem_projectId_planMonthKey_idx" ON "ContentCalendarItem"("projectId", "planMonthKey");

-- CreateIndex
CREATE INDEX "ContentCalendarItem_projectId_planStableKey_idx" ON "ContentCalendarItem"("projectId", "planStableKey");

-- CreateIndex
CREATE INDEX "ProjectMessage_authorUserId_idx" ON "ProjectMessage"("authorUserId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_assignedStudioUserId_fkey" FOREIGN KEY ("assignedStudioUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInternalNote" ADD CONSTRAINT "ProjectInternalNote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInternalNote" ADD CONSTRAINT "ProjectInternalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBrandKit" ADD CONSTRAINT "UserBrandKit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNotification" ADD CONSTRAINT "ClientNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioTeamMember" ADD CONSTRAINT "StudioTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioTeamChatMessage" ADD CONSTRAINT "StudioTeamChatMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioNotification" ADD CONSTRAINT "StudioNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioAgencyInboxDismissal" ADD CONSTRAINT "StudioAgencyInboxDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioAgencyInboxDismissal" ADD CONSTRAINT "StudioAgencyInboxDismissal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyTodo" ADD CONSTRAINT "AgencyTodo_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyTodo" ADD CONSTRAINT "AgencyTodo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioTimeOff" ADD CONSTRAINT "StudioTimeOff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectQuote" ADD CONSTRAINT "ProjectQuote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishedClientReview" ADD CONSTRAINT "PublishedClientReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsitePageBrief" ADD CONSTRAINT "WebsitePageBrief_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentCalendarItem" ADD CONSTRAINT "ContentCalendarItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAsset" ADD CONSTRAINT "ReviewAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMessage" ADD CONSTRAINT "ProjectMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMessage" ADD CONSTRAINT "ProjectMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
