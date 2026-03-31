-- =============================================================================
-- Collectiv Studio — agency accounts (Issy, Harriet, May)
-- Paste into Supabase SQL Editor and run once (safe to re-run: upserts by email / userId).
--
-- PASSWORDS (bcrypt cost 10, bcryptjs — matches prisma/seed.cjs):
--   isabella@collectivstudio.uk   →  CsTmp-Issy-7mN!
--   harriet@collectivstudio.uk    →  CsTmp-Harriet-9kL!
--   zbyszka@collectivstudio.uk    →  CsTmp-May-4pQ!
--
-- Hashes generated with: require("bcryptjs").hash(plainPassword, 10)
--
-- After run: set STUDIO_EMAIL and STUDIO_PERSONA_*_EMAIL in Vercel/.env (see .env.example).
-- =============================================================================

-- Issy (Isabella) — personaSlug must stay "isabella" for dashboard routing
INSERT INTO "User" (id, email, "passwordHash", name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'isabella@collectivstudio.uk',
  '$2b$10$h.9gPYCY4R5V0U2kVOsejuA/ojtC8p1gPa0G7MD6FS3J0AhOS4nkG',
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
WHERE u.email = 'isabella@collectivstudio.uk'
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
  'harriet@collectivstudio.uk',
  '$2b$10$NjAfsoJN3H7r8uzY/zLO/O5VksnZ2p.rgvHqb66YOrNUiXMKIz4qW',
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
WHERE u.email = 'harriet@collectivstudio.uk'
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
  'zbyszka@collectivstudio.uk',
  '$2b$10$peXKW1I4c7MRdTnnGbyEOOR7BREw5K6ocMv8ze0Jbgt31INEw5avm',
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
WHERE u.email = 'zbyszka@collectivstudio.uk'
ON CONFLICT ("userId") DO UPDATE SET
  "personaSlug" = EXCLUDED."personaSlug",
  "jobTitle" = EXCLUDED."jobTitle",
  "welcomeName" = EXCLUDED."welcomeName",
  "photoUrl" = EXCLUDED."photoUrl",
  "availabilityNote" = EXCLUDED."availabilityNote",
  "updatedAt" = now();
