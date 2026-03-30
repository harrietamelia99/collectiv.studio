import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * In development, `globalThis.prisma` can outlive `prisma generate`. An old client then misses new
 * delegates (e.g. `publishedClientReview`), which surfaces as `undefined.findMany` on the home page.
 * Recreate the client when the cached instance looks stale.
 */
function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }

  const existing = globalForPrisma.prisma;
  const delegates = existing as unknown as Record<string, unknown> | undefined;
  const looksCurrent =
    delegates &&
    typeof delegates.publishedClientReview === "object" &&
    typeof delegates.projectQuote === "object" &&
    typeof delegates.agencyTodo === "object" &&
    typeof delegates.studioTeamMember === "object";

  if (looksCurrent && existing) return existing;

  const fresh = createPrismaClient();
  globalForPrisma.prisma = fresh;
  return fresh;
}

export const prisma = getPrisma();
