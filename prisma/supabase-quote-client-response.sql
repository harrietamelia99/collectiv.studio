-- Run in Supabase SQL Editor: add quote response fields without dropping data.
-- Idempotent: safe to run more than once.

ALTER TABLE "ProjectQuote" ADD COLUMN IF NOT EXISTS "quoteStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ProjectQuote" ADD COLUMN IF NOT EXISTS "quoteDeclineReason" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProjectQuote" ADD COLUMN IF NOT EXISTS "quoteRespondedAt" TIMESTAMP(3);

-- Optional: backfill — existing rows already get DEFAULT 'PENDING' on add.
