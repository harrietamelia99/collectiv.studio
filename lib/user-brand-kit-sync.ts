import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** After creating a project for an existing client, copy saved brand kit onto empty project fields. */
export async function copyUserBrandKitToNewProject(projectId: string, userId: string): Promise<void> {
  const kit = await prisma.userBrandKit.findUnique({ where: { userId } });
  if (!kit) return;

  const data: Prisma.ProjectUpdateInput = {};
  if (kit.websitePrimaryHex?.trim()) data.websitePrimaryHex = kit.websitePrimaryHex;
  if (kit.websiteSecondaryHex?.trim()) data.websiteSecondaryHex = kit.websiteSecondaryHex;
  if (kit.websiteAccentHex?.trim()) data.websiteAccentHex = kit.websiteAccentHex;
  if (kit.websiteQuaternaryHex?.trim()) data.websiteQuaternaryHex = kit.websiteQuaternaryHex;
  if (kit.websiteFontPaths && kit.websiteFontPaths !== "[]") data.websiteFontPaths = kit.websiteFontPaths;
  if (kit.websiteLogoPath?.trim()) data.websiteLogoPath = kit.websiteLogoPath;
  if (kit.websiteLogoVariationsJson && kit.websiteLogoVariationsJson !== "[]") {
    data.websiteLogoVariationsJson = kit.websiteLogoVariationsJson;
  }

  if (Object.keys(data).length === 0) return;
  await prisma.project.update({ where: { id: projectId }, data });
}

/**
 * When a branding project wraps, copy agreed kit fields from the project onto the client’s account kit
 * so future website / social projects can reuse them.
 */
export async function upsertUserBrandKitFromBrandingProject(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      portalKind: true,
      websitePrimaryHex: true,
      websiteSecondaryHex: true,
      websiteAccentHex: true,
      websiteQuaternaryHex: true,
      websiteFontPaths: true,
      websiteLogoPath: true,
      websiteLogoVariationsJson: true,
    },
  });
  if (!project?.userId || project.portalKind !== "BRANDING") return;

  const hasAny =
    project.websitePrimaryHex?.trim() ||
    project.websiteSecondaryHex?.trim() ||
    project.websiteAccentHex?.trim() ||
    project.websiteQuaternaryHex?.trim() ||
    (project.websiteFontPaths && project.websiteFontPaths !== "[]") ||
    project.websiteLogoPath?.trim() ||
    (project.websiteLogoVariationsJson && project.websiteLogoVariationsJson !== "[]");
  if (!hasAny) return;

  await prisma.userBrandKit.upsert({
    where: { userId: project.userId },
    create: {
      userId: project.userId,
      websitePrimaryHex: project.websitePrimaryHex?.trim() || null,
      websiteSecondaryHex: project.websiteSecondaryHex?.trim() || null,
      websiteAccentHex: project.websiteAccentHex?.trim() || null,
      websiteQuaternaryHex: project.websiteQuaternaryHex?.trim() || null,
      websiteFontPaths: project.websiteFontPaths || "[]",
      websiteLogoPath: project.websiteLogoPath?.trim() || null,
      websiteLogoVariationsJson: project.websiteLogoVariationsJson || "[]",
    },
    update: {
      ...(project.websitePrimaryHex?.trim() ? { websitePrimaryHex: project.websitePrimaryHex } : {}),
      ...(project.websiteSecondaryHex?.trim() ? { websiteSecondaryHex: project.websiteSecondaryHex } : {}),
      ...(project.websiteAccentHex?.trim() ? { websiteAccentHex: project.websiteAccentHex } : {}),
      ...(project.websiteQuaternaryHex?.trim() ? { websiteQuaternaryHex: project.websiteQuaternaryHex } : {}),
      ...(project.websiteFontPaths && project.websiteFontPaths !== "[]" ? { websiteFontPaths: project.websiteFontPaths } : {}),
      ...(project.websiteLogoPath?.trim() ? { websiteLogoPath: project.websiteLogoPath } : {}),
      ...(project.websiteLogoVariationsJson && project.websiteLogoVariationsJson !== "[]"
        ? { websiteLogoVariationsJson: project.websiteLogoVariationsJson }
        : {}),
    },
  });
}
