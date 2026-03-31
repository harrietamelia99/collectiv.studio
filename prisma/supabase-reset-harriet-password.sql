-- =============================================================================
-- Reset Harriet’s portal password (Supabase → SQL Editor)
--
-- App verification (see lib/auth-options.ts):
--   import bcrypt from "bcryptjs";
--   await bcrypt.compare(plainPassword, user.passwordHash);
-- Passwords are set with the same library and cost factor:
--   await bcrypt.hash(plainPassword, 10);
--
-- After this UPDATE, log in at /portal/login with:
--   Email:    harriet@collectiv.local
--   Password: Collectiv-Harriet-SQL-2026
--
-- Hash below was generated with: bcryptjs.hash("Collectiv-Harriet-SQL-2026", 10)
-- (Node, same dependency as the Next.js app — package "bcryptjs").
-- =============================================================================

UPDATE "User"
SET
  "passwordHash" = '$2b$10$xzLHRKNompNtX5akfAFMu.CzHA8wPSm6XrzoX7irqlGbj4bK0npO.',
  "updatedAt" = now()
WHERE email = 'harriet@collectiv.local';

-- Expect: UPDATE 1
