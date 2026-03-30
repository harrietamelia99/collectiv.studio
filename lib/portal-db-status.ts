import { prisma } from "@/lib/prisma";

let cached: boolean | null = null;
let cachedAt = 0;
const TTL_MS = 20_000;

/**
 * True when `DATABASE_URL` is set and Prisma can run a trivial query.
 * Cached briefly to avoid hammering the DB on every RSC render.
 */
export async function getPortalDatabaseAvailable(): Promise<boolean> {
  if (process.env.PORTAL_FORCE_OFFLINE === "1") return false;
  if (!process.env.DATABASE_URL?.trim()) return false;

  const now = Date.now();
  if (cached !== null && now - cachedAt < TTL_MS) return cached;

  try {
    await prisma.$queryRaw`SELECT 1`;
    cached = true;
  } catch {
    cached = false;
  }
  cachedAt = now;
  return cached;
}

export function resetPortalDatabaseStatusCache(): void {
  cached = null;
  cachedAt = 0;
}
