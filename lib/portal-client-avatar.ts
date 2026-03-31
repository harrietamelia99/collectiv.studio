import { unlink } from "fs/promises";
import path from "path";
import { deleteUploadThingFileByStoredValue, uploadBufferToUploadThing } from "@/lib/uploadthing";
import { uploadRoot, validateUploadExtension } from "@/lib/portal-uploads";

export function portalClientAvatarPublicUrl(userId: string, stored: string): string {
  const s = stored.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const base = s.split("/").filter(Boolean).pop() ?? "";
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
  return uploadBufferToUploadThing(originalName, data);
}

export async function removeOldAvatarFile(previousRelative: string | null | undefined): Promise<void> {
  if (!previousRelative?.trim()) return;
  const s = previousRelative.trim();
  if (/^https?:\/\//i.test(s)) {
    await deleteUploadThingFileByStoredValue(s);
    return;
  }
  const normalized = path.normalize(s).replace(/^(\.\.(\/|\\|$))+/, "");
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
