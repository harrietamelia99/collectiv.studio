-- Supabase SQL editor: add quote deposit fields (idempotent).
ALTER TABLE "ProjectQuote" ADD COLUMN IF NOT EXISTS "depositPercent" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "ProjectQuote" ADD COLUMN IF NOT EXISTS "depositNote" TEXT NOT NULL DEFAULT '';
