-- AlterTable
ALTER TABLE "ProjectQuote" ADD COLUMN "quoteStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ProjectQuote" ADD COLUMN "quoteDeclineReason" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProjectQuote" ADD COLUMN "quoteRespondedAt" TIMESTAMP(3);
