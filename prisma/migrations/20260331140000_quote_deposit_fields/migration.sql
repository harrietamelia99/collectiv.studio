-- AlterTable
ALTER TABLE "ProjectQuote" ADD COLUMN "depositPercent" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "ProjectQuote" ADD COLUMN "depositNote" TEXT NOT NULL DEFAULT '';
