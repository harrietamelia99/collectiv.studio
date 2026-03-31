-- Supabase SQL editor: add Issy workspace unlock timestamp (idempotent).
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "workspaceUnlockedAt" TIMESTAMP(3);

-- Optional one-time backfill: projects that already met contract (+ deposit where required) keep hub access
-- without waiting for Issy to click unlock again. Run once after deploying the app change.
-- UPDATE "Project"
-- SET "workspaceUnlockedAt" = COALESCE("studioDepositMarkedPaidAt", "clientContractSignedAt", NOW())
-- WHERE "workspaceUnlockedAt" IS NULL
--   AND "clientVerifiedAt" IS NULL
--   AND "clientContractSignedAt" IS NOT NULL
--   AND (
--     TRIM(UPPER("portalKind")) = 'SOCIAL'
--     OR "studioDepositMarkedPaidAt" IS NOT NULL
--   );
