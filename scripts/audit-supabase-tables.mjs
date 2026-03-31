/**
 * Run from repo root with DATABASE_URL (+ DIRECT_URL) in .env:
 *   node scripts/audit-supabase-tables.mjs
 * Lists public tables, compares to expected Prisma models, prints row counts.
 */
import { PrismaClient } from "@prisma/client";

const expected = [
  "User",
  "Project",
  "ProjectInternalNote",
  "UserBrandKit",
  "ClientNotification",
  "StudioTeamMember",
  "StudioTeamChatMessage",
  "StudioNotification",
  "StudioAgencyInboxDismissal",
  "AgencyTodo",
  "StudioTimeOff",
  "ProjectQuote",
  "PublishedClientReview",
  "ChatQuestionStat",
  "FaqSuggestion",
  "SiteFaq",
  "WebsitePageBrief",
  "ContentCalendarItem",
  "ReviewAsset",
  "ProjectMessage",
];

const prisma = new PrismaClient();

try {
  const rows = await prisma.$queryRaw`
    SELECT c.relname AS name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname NOT LIKE '\\_%'
    ORDER BY c.relname`;
  const dbTables = new Set(rows.map((r) => r.name));
  const prismaSet = new Set(expected);
  const missing = expected.filter((t) => !dbTables.has(t));
  const extra = [...dbTables].filter((t) => !prismaSet.has(t) && t !== "_prisma_migrations");

  console.log("=== Tables vs Prisma models ===");
  console.log("Missing in DB:", missing.length ? missing.join(", ") : "none");
  console.log("Extra in DB (not in model list):", extra.length ? extra.join(", ") : "none");

  console.log("\n=== Row counts (pg_stat_user_tables estimates) ===");
  const stats = await prisma.$queryRaw`
    SELECT relname, n_live_tup::bigint AS est
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY relname`;
  for (const r of stats) {
    console.log(`${r.relname}\t${r.est}`);
  }
} finally {
  await prisma.$disconnect();
}
