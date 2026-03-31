# Supabase / Portal connection audit

**Date:** 2026-03-31  
**Scope:** Prisma schema, initial migration, RLS SQL, and codebase patterns for the Collectiv portal.

**Limits of this audit**

- **Supabase MCP** was **not** available to the agent in this session (no MCP tools wired in).
- Live SQL against your project **failed from the agent environment** (`Can't reach database server`). You should run checks locally or in Supabase SQL Editor.
- **End-to-end QA** (every button, every role, every upload) was **not** executed in a browser; items below note **code-level** verification vs **manual** verification.

**Run this locally after `DATABASE_URL` / `DIRECT_URL` work:**

```bash
cd collectiv-studio
npx prisma migrate status
node scripts/audit-supabase-tables.mjs
npm run seed   # idempotent; safe to re-run for studio personas
```

---

## Step 1 — Database audit

### Expected tables (Prisma models → Postgres)

All map 1:1 to quoted tables in `prisma/migrations/20260330204635_init/migration.sql`:

| Model | Table |
|--------|--------|
| User | `"User"` |
| Project | `"Project"` |
| ProjectInternalNote | `"ProjectInternalNote"` |
| UserBrandKit | `"UserBrandKit"` |
| ClientNotification | `"ClientNotification"` |
| StudioTeamMember | `"StudioTeamMember"` |
| StudioTeamChatMessage | `"StudioTeamChatMessage"` |
| StudioNotification | `"StudioNotification"` |
| StudioAgencyInboxDismissal | `"StudioAgencyInboxDismissal"` |
| AgencyTodo | `"AgencyTodo"` |
| StudioTimeOff | `"StudioTimeOff"` |
| ProjectQuote | `"ProjectQuote"` |
| PublishedClientReview | `"PublishedClientReview"` |
| ChatQuestionStat | `"ChatQuestionStat"` |
| FaqSuggestion | `"FaqSuggestion"` |
| SiteFaq | `"SiteFaq"` |
| WebsitePageBrief | `"WebsitePageBrief"` |
| ContentCalendarItem | `"ContentCalendarItem"` |
| ReviewAsset | `"ReviewAsset"` |
| ProjectMessage | `"ProjectMessage"` |

Plus `_prisma_migrations` (Prisma metadata).

### Missing / extra tables or columns

- **Not verified live** here. If `prisma migrate status` reports **pending** migrations, apply them (`npx prisma migrate deploy` in prod, `migrate dev` locally).
- **Drift:** Run `npx prisma db pull` and diff `schema.prisma` if you edited tables in the Supabase UI.

### Foreign keys

- Declared in the same migration via `ALTER TABLE ... ADD CONSTRAINT` (Prisma-style). **Confirm in Supabase:** Table Editor → Relationships, or query `information_schema` / `pg_constraint`.

---

## Step 2 — Authentication

### NextAuth ↔ Supabase

- **Sessions are JWTs**, not rows in a `Session` table. There is **no** `@auth/prisma-adapter` / `PrismaAdapter` in this repo.
- **Credentials** validate against **`User.passwordHash`** via Prisma (`lib/auth-options.ts`).
- **Supabase Auth** is **not** used for portal login in this codebase; only `DATABASE_URL` backs Prisma.

### “Four roles” (CLIENT, HARRIET, ISSY, MAY)

- These are **not** stored as a single DB enum on `User`.
- **`session.user.portalRole`:** `AGENCY` if email is in `STUDIO_EMAIL` / studio logic (`isStudioUser`), else `CLIENT`.
- **`session.user.agencyRole`:** `ISSY` | `HARRIET` | `MAY` | `null` from `StudioTeamMember.personaSlug` (`isabella` → ISSY, `harriet` → HARRIET, `may` → MAY).

### Seed (Harriet, Issy, May)

- `prisma/seed.cjs` upserts `isabella@collectivstudio.uk`, `harriet@collectivstudio.uk`, `zbyszka@collectivstudio.uk` (May) and matching **`StudioTeamMember`** rows (no bundled demo client).
- **Verify:** run `npm run seed`, then query `"User"` + `"StudioTeamMember"` (or use Table Editor).

### Registration / login / session persistence

- **Code:** Registration and portal actions live in `app/portal/actions.ts` (large file, heavy Prisma usage).
- **Session:** `maxAge: 30 * 24 * 60 * 60` (30 days) in `auth-options.ts`.
- **Manual:** Register a test client, log in as each studio email, confirm redirects and dashboards.

---

## Step 3 — Client onboarding (contract, deposit, hub, quote, contract snapshot)

### Data fields (Project)

- Contract / deposit gates use **`clientContractSignedAt`**, **`studioDepositMarkedPaidAt`**, **`contractSignedSnapshotText`**, **`contractSignedTypedName`**, etc. (see `lib/portal-client-full-access.ts`, `lib/portal-workflow.ts`, `AgencyProjectStudioView.tsx`).
- **Agency UI** exposes mark/clear contract and deposit (`AgencyProjectStudioView.tsx` + server actions in `actions.ts`).

### Hub unlock / quote

- **Unlock logic** is centralized in portal workflow / full-access helpers reading **Project** fields from Prisma.
- **Quote:** `ProjectQuote` model; create/update flows should go through `actions.ts` (search `projectQuote` / `ProjectQuote`).

**Manual:** Walk one project: mark contract → mark deposit → confirm client hub unlocks; send quote and confirm persistence.

---

## Step 4 — Projects

- **Create project:** agency flows use Prisma `project.create` / related (see `actions.ts`, `AgencyCreateProjectForm.tsx`).
- **Client visibility:** projects tied to `userId` / `invitedClientEmail` per schema; portal pages load via `projectId` with access guards in `lib/portal-access.ts` and related.
- **`portalKind`**, **`assignedStudioUserId`**, **`paymentStatus`**, workflow JSON fields — all columns on **`Project`**.

**Manual:** Create project as agency, register/login as client with invited email, confirm card and project hub.

---

## Step 5 — Project steps (website, branding, signage, print)

- Step completion is persisted on **`Project`** (booleans, JSON blobs, timestamps) and related models (**`ReviewAsset`**, **`WebsitePageBrief`**, etc.).
- **Locking / progress:** `lib/portal-workflow.ts`, `lib/portal-progress.ts`, and server actions in `actions.ts` implement gates; **not** re-audited line-by-line in this pass.

**Manual:** Complete each step type once and reload; confirm no “fake” unlock without DB writes.

---

## Step 6 — Brand kit

- **`UserBrandKit`** model; sync/copy into projects handled in `lib/user-brand-kit-sync.ts` and portal branding flows.

**Manual:** Edit account brand kit, create new project, confirm prefill.

---

## Step 7 — Social calendar

- **`ContentCalendarItem`**, **`Project.socialWeeklyScheduleJson`**, batch/status fields on items; many mutations in `actions.ts` and `social-batch-actions.ts`.

**Manual:** Issy schedule → May posts → client approval / feedback → batch submit; verify rows in `ContentCalendarItem`.

---

## Step 8 — Messaging

- **Client/studio thread:** `ProjectMessage`.
- **Internal notes:** `ProjectInternalNote` (agency-only).
- **Team chat:** `StudioTeamChatMessage`.
- **Inbox dismissals:** `StudioAgencyInboxDismissal`.

All are standard Prisma models; creation should flow through `actions.ts` / related modules.

---

## Step 9 — Notifications

- **Client bell:** `ClientNotification` (e.g. `lib/client-in-app-notify.ts`, `markClientNotificationRead` in `actions.ts`).
- **Studio:** `StudioNotification` + related notify helpers under `lib/portal-notify.ts`, `lib/studio-notify.ts`, etc.

**Manual:** Trigger each important event once and confirm a row appears (or use SQL count before/after).

---

## Step 10 — Agency dashboard

- Reads **`Project`**, **`AgencyTodo`**, **`User`**, messages, calendar snippets — via server components and `actions.ts`.
- **Todos:** complete/delete should hit Prisma in agency action handlers.

**Manual:** Dashboard load, todo CRUD, payment status controls.

---

## Step 11 — Row Level Security (RLS)

- **`prisma/supabase-rls.sql`** defines helpers and policies for the **`authenticated`** role (JWT `email` matching `User.email`).
- **Important:** The **Next.js app uses Prisma** with the **database connection user** (typically table owner), which **bypasses RLS** in Postgres. So **portal security is enforced in application code** (middleware + `lib/portal-access.ts` + server actions), **not** by RLS for Prisma traffic.
- RLS **does** matter if you later use **Supabase client / PostgREST** from the browser with Supabase Auth.

**Verify in Supabase:** SQL Editor → `SELECT * FROM pg_policies WHERE schemaname = 'public';`

---

## Step 12 — Summary

### Fully aligned (schema + migration + typical Prisma usage)

- Single PostgreSQL schema with **20 app tables** matching **20 Prisma models** (per initial migration).
- Portal is built around **Prisma → Postgres**; `app/portal/actions.ts` alone contains **100+** `prisma.` references.
- NextAuth **credentials + JWT** backed by **`User`** / **`StudioTeamMember`**.
- RLS SQL file exists for Supabase API-style access; Prisma path remains **app-level** authorization.

### Needs live verification (you / QA)

- **Row counts** and **missing tables/columns:** run `node scripts/audit-supabase-tables.mjs` and `npx prisma migrate status`.
- **Every** step 3–10 bullet as **click-through** for each role (CLIENT, ISSY, HARRIET, MAY) and each `portalKind`.
- **File uploads:** confirm files land under your hosting’s upload store and **paths** persist on the right rows (env-specific).

### RLS

- Policies are **documented in-repo** (`prisma/supabase-rls.sql`); re-apply after edits:  
  `npx prisma db execute --file prisma/supabase-rls.sql --schema prisma/schema.prisma`

### Recommendations

1. **Optional:** Add **E2E tests** (Playwright) for login + one full project flow.
2. **Optional:** `@auth/prisma-adapter`** only if you want **database sessions** in Postgres (separate from current JWT design).
3. **Supabase Auth** is **not** wired to NextAuth today; linking them would be a **large** change.
4. Keep **`DATABASE_URL`** (pooler) + **`DIRECT_URL`** (direct) on Vercel as you have now.

---

*This document replaces an MCP-driven live audit for environments where MCP/DB access from the agent is unavailable.*
