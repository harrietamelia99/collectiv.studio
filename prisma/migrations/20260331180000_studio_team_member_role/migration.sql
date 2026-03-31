-- AlterTable
ALTER TABLE "StudioTeamMember" ADD COLUMN "studioRole" TEXT NOT NULL DEFAULT 'ISSY';

-- Backfill from legacy persona slugs
UPDATE "StudioTeamMember" SET "studioRole" = CASE "personaSlug"
  WHEN 'isabella' THEN 'ISSY'
  WHEN 'harriet' THEN 'HARRIET'
  WHEN 'may' THEN 'SOCIAL_MANAGER'
  ELSE 'ISSY'
END;

-- May (and future social managers) keep personaSlug for display; allow duplicate slugs across roles
ALTER TABLE "StudioTeamMember" DROP CONSTRAINT IF EXISTS "StudioTeamMember_personaSlug_key";

-- CreateIndex
CREATE INDEX "StudioTeamMember_studioRole_idx" ON "StudioTeamMember"("studioRole");
