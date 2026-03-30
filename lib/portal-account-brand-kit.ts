import { prisma } from "@/lib/prisma";
import type { AccountBrandKitSlice } from "@/lib/portal-workflow";

export async function loadAccountBrandKitSlice(userId: string | null | undefined): Promise<AccountBrandKitSlice> {
  if (!userId) return null;
  const row = await prisma.userBrandKit.findUnique({
    where: { userId },
    select: {
      websitePrimaryHex: true,
      websiteFontPaths: true,
      websiteLogoPath: true,
    },
  });
  return row;
}
