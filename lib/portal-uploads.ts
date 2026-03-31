import path from "path";
import { uploadBufferToUploadThing } from "@/lib/uploadthing";

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
/** Brand / logo vectors: SVG + PDF only (per product spec). */
const VECTOR_EXT = new Set([".svg", ".pdf"]);
const VIDEO_EXT = new Set([".mp4", ".mov"]);

function extFromName(originalName: string): string {
  const base = path.basename(originalName).toLowerCase();
  const i = base.lastIndexOf(".");
  return i >= 0 ? base.slice(i) : "";
}

export type UploadKind =
  | "raster"
  | "vector"
  | "video"
  | "reviewAsset"
  | "socialCalendarCreative"
  | "pdf";

const CALENDAR_IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CALENDAR_VIDEO_EXT = new Set([".mp4", ".mov"]);

export function validateUploadExtension(originalName: string, kind: UploadKind): string | null {
  const ext = extFromName(originalName);
  if (!ext) return "Add a file extension (e.g. .png or .svg).";

  switch (kind) {
    case "raster":
      return RASTER_EXT.has(ext) ? null : "Images must be JPG, PNG, or WEBP.";
    case "vector":
      return VECTOR_EXT.has(ext) ? null : "Logos and vector art must be SVG or PDF.";
    case "video":
      return VIDEO_EXT.has(ext) ? null : "Videos must be MP4 or MOV.";
    case "pdf":
      return ext === ".pdf" ? null : "Only PDF is allowed.";
    case "reviewAsset":
      if (RASTER_EXT.has(ext) || VECTOR_EXT.has(ext)) return null;
      return "Proofs must be an image (JPG, PNG, WEBP), vector (SVG), or PDF.";
    case "socialCalendarCreative":
      if (CALENDAR_IMAGE_EXT.has(ext) || CALENDAR_VIDEO_EXT.has(ext)) return null;
      return "Creative must be JPG, PNG, WEBP, MP4, or MOV.";
    default:
      return "Unsupported file type.";
  }
}

export function socialCalendarUploadMediaKind(originalName: string): "image" | "video" | null {
  const ext = extFromName(originalName);
  if (CALENDAR_IMAGE_EXT.has(ext)) return "image";
  if (CALENDAR_VIDEO_EXT.has(ext)) return "video";
  return null;
}

/** Legacy local upload root (for reading old rows that still store `projectId/...` paths). */
export function uploadRoot(): string {
  return path.join(process.cwd(), "uploads");
}

export function safeSegment(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "file";
}

/**
 * Validates `kind`, uploads to UploadThing, returns public `ufsUrl` for Prisma (same string fields as before).
 */
export async function saveProjectUpload(
  projectId: string,
  originalName: string,
  data: Buffer,
  kind: UploadKind,
): Promise<string> {
  void projectId;
  const bad = validateUploadExtension(originalName, kind);
  if (bad) throw new Error(bad);
  const stored = (await uploadBufferToUploadThing(originalName, data)).trim();
  if (!stored) throw new Error("Upload succeeded but no file URL was returned.");
  if (!/^https?:\/\//i.test(stored) && !stored.includes("/")) {
    throw new Error("Upload returned an unexpected path format.");
  }
  return stored;
}

/** Web font files (woff/woff2/ttf/otf) — not restricted to image/video routes. */
export async function saveFontUpload(projectId: string, originalName: string, data: Buffer): Promise<string> {
  void projectId;
  const lower = originalName.toLowerCase();
  if (!/\.(woff2?|ttf|otf)$/.test(lower)) {
    throw new Error("Fonts must be WOFF, WOFF2, TTF, or OTF.");
  }
  const stored = (await uploadBufferToUploadThing(originalName, data)).trim();
  if (!stored) throw new Error("Upload succeeded but no file URL was returned.");
  return stored;
}

/** Map upload / Prisma failures to a short, user-safe message for UI or server-action errors. */
export function formatPortalUploadFailureForUser(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/UPLOADTHING_TOKEN|not set/i.test(raw)) {
    return "File uploads are not configured on the server (missing storage credentials). Please contact the studio.";
  }
  if (/UploadThing|uploadthing|ufsUrl|presigned/i.test(raw)) {
    return raw.length > 220 ? `${raw.slice(0, 220)}…` : raw;
  }
  if (/P20\d{2}/.test(raw) || /prisma/i.test(raw)) {
    return "Could not save the file to the project. Please try again.";
  }
  if (raw.length <= 220) return raw;
  return `${raw.slice(0, 220)}…`;
}

export function rethrowPortalUploadAction(ctx: string, err: unknown): never {
  console.error(`[portal upload] ${ctx}`, err);
  throw new Error(formatPortalUploadFailureForUser(err));
}

/** @deprecated Prefer storing UploadThing URLs; used only for legacy disk paths. */
export function absoluteUploadPath(relative: string): string {
  const normalized = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(uploadRoot(), normalized);
}
