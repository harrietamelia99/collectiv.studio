import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { uploadRoot, safeSegment, validateUploadExtension } from "@/lib/portal-uploads";

/** Relative path under upload root: avatars/{userId}/{uuid}-name.ext */
export function portalClientAvatarPublicUrl(userId: string, relativePathFromDb: string): string {
  const base = relativePathFromDb.split("/").filter(Boolean).pop() ?? "";
  if (!base) return "";
  return `/api/portal/client-avatar/${encodeURIComponent(userId)}/${encodeURIComponent(base)}`;
}

export async function saveClientAvatarFile(
  userId: string,
  originalName: string,
  data: Buffer,
): Promise<string> {
  const bad = validateUploadExtension(originalName, "raster");
  if (bad) throw new Error(bad);
  if (data.length > 4 * 1024 * 1024) throw new Error("Image must be 4MB or smaller.");

  const dir = path.join(uploadRoot(), "avatars", userId);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}-${safeSegment(originalName)}`;
  const full = path.join(dir, name);
  await writeFile(full, data);
  return `avatars/${userId}/${name}`;
}

export async function removeOldAvatarFile(previousRelative: string | null | undefined): Promise<void> {
  if (!previousRelative?.trim()) return;
  const normalized = path.normalize(previousRelative).replace(/^(\.\.(\/|\\|$))+/, "");
  if (!normalized.startsWith("avatars/")) return;
  const abs = path.join(uploadRoot(), normalized);
  const root = path.resolve(uploadRoot());
  if (!abs.startsWith(root + path.sep)) return;
  try {
    await unlink(abs);
  } catch {
    /* ignore */
  }
}
