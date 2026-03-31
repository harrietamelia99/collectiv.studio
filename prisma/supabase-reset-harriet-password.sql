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
--   Email:    harriet@collectivstudio.uk
--   Password: CsTmp-Harriet-9kL!
--
-- Hash: bcryptjs.hash("CsTmp-Harriet-9kL!", 10)
-- =============================================================================

UPDATE "User"
SET
  "passwordHash" = '$2b$10$NjAfsoJN3H7r8uzY/zLO/O5VksnZ2p.rgvHqb66YOrNUiXMKIz4qW',
  "updatedAt" = now()
WHERE email = 'harriet@collectivstudio.uk';

-- Expect: UPDATE 1
