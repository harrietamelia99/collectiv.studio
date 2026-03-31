-- =============================================================================
-- Collectiv Studio — agency accounts (Issy, Harriet, May)
-- Paste into Supabase SQL Editor and run once (safe to re-run: upserts by email / userId).
--
-- TEMPORARY PASSWORDS (bcrypt cost 10, matches app bcryptjs):
--   isabella@collectiv.local   →  Collectiv-Temp-Issy-2026!
--   harriet@collectiv.local    →  Collectiv-Temp-Harriet-2026!
--   may@collectiv.local        →  Collectiv-Temp-May-2026!
--
-- After run: add these exact emails to STUDIO_EMAIL in Vercel/.env (comma-separated)
-- so NextAuth treats them as agency (see lib/portal-studio-users.ts).
-- Replace @collectiv.local addresses below with real work emails if you prefer, then
-- use the same addresses in STUDIO_EMAIL and share the matching temp password.
-- =============================================================================

-- Issy (Isabella) — personaSlug must stay "isabella" for dashboard routing
INSERT INTO "User" (id, email, "passwordHash", name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'isabella@collectiv.local',
  '$2b$10$Z0fGFFQm0e9iyGw3HNVmjeaeJN2YOgaNfeWZ/hzbmn5LwjuGjEAju',
  'Isabella',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "updatedAt" = now();

INSERT INTO "StudioTeamMember" (id, "userId", "personaSlug", "jobTitle", "availabilityNote", "welcomeName", "photoUrl", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u.id,
  'isabella',
  'Operations — project flow, calendar, assigning, client comms',
  '',
  'Issy',
  '/images/team-isabella.png',
  now(),
  now()
FROM "User" u
WHERE u.email = 'isabella@collectiv.local'
ON CONFLICT ("userId") DO UPDATE SET
  "personaSlug" = EXCLUDED."personaSlug",
  "jobTitle" = EXCLUDED."jobTitle",
  "welcomeName" = EXCLUDED."welcomeName",
  "photoUrl" = EXCLUDED."photoUrl",
  "availabilityNote" = EXCLUDED."availabilityNote",
  "updatedAt" = now();

-- Harriet
INSERT INTO "User" (id, email, "passwordHash", name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'harriet@collectiv.local',
  '$2b$10$gylwJy0P2qPFb0PMiRkAaO6J752DUG5I5DK/d4OYFXrD4ZDelO6Se',
  'Harriet',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "updatedAt" = now();

INSERT INTO "StudioTeamMember" (id, "userId", "personaSlug", "jobTitle", "availabilityNote", "welcomeName", "photoUrl", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u.id,
  'harriet',
  'Designer & business owner',
  'Mon–Thu 9–5 · Fri AM · OOO noted in portal',
  'Harriet',
  '/images/team-harriet.png',
  now(),
  now()
FROM "User" u
WHERE u.email = 'harriet@collectiv.local'
ON CONFLICT ("userId") DO UPDATE SET
  "personaSlug" = EXCLUDED."personaSlug",
  "jobTitle" = EXCLUDED."jobTitle",
  "welcomeName" = EXCLUDED."welcomeName",
  "photoUrl" = EXCLUDED."photoUrl",
  "availabilityNote" = EXCLUDED."availabilityNote",
  "updatedAt" = now();

-- May
INSERT INTO "User" (id, email, "passwordHash", name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'may@collectiv.local',
  '$2b$10$Lm0eiGpSd.YVpc.YvwQ8cOA4.H9Qa5B9VjWcOHDHFXRducfw86qDq',
  'May',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "updatedAt" = now();

INSERT INTO "StudioTeamMember" (id, "userId", "personaSlug", "jobTitle", "availabilityNote", "welcomeName", "photoUrl", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u.id,
  'may',
  'Social media — client comms, processes & calendar sign-off',
  '',
  'May',
  '/images/team-may.png',
  now(),
  now()
FROM "User" u
WHERE u.email = 'may@collectiv.local'
ON CONFLICT ("userId") DO UPDATE SET
  "personaSlug" = EXCLUDED."personaSlug",
  "jobTitle" = EXCLUDED."jobTitle",
  "welcomeName" = EXCLUDED."welcomeName",
  "photoUrl" = EXCLUDED."photoUrl",
  "availabilityNote" = EXCLUDED."availabilityNote",
  "updatedAt" = now();
