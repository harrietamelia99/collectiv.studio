import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VECTOR_EXT = new Set([".svg", ".eps", ".ai", ".pdf"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".m4v"]);

function extFromName(originalName: string): string {
  const base = path.basename(originalName).toLowerCase();
  const i = base.lastIndexOf(".");
  return i >= 0 ? base.slice(i) : "";
}

export type UploadKind = "raster" | "vector" | "video" | "reviewAsset" | "socialCalendarCreative";

const CALENDAR_IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CALENDAR_VIDEO_EXT = new Set([".mp4", ".mov"]);

/** JPG / PNG / WEBP / MP4 / MOV for social calendar creative uploads. */
export function validateUploadExtension(originalName: string, kind: UploadKind): string | null {
  const ext = extFromName(originalName);
  if (!ext) return "Add a file extension (e.g. .png or .svg).";

  switch (kind) {
    case "raster":
      return RASTER_EXT.has(ext) || ext === ".gif" ? null : "Images must be JPG, PNG, WEBP, or GIF.";
    case "vector":
      return VECTOR_EXT.has(ext) ? null : "Logos and vector art must be SVG, EPS, AI, or PDF.";
    case "video":
      return VIDEO_EXT.has(ext) ? null : "Videos must be MP4 or MOV.";
    case "reviewAsset":
      if (RASTER_EXT.has(ext) || VECTOR_EXT.has(ext) || ext === ".pdf") return null;
      return "Proofs must be an image (JPG, PNG, WEBP), vector (SVG, EPS, AI), or PDF.";
    case "socialCalendarCreative":
      if (CALENDAR_IMAGE_EXT.has(ext) || CALENDAR_VIDEO_EXT.has(ext)) return null;
      return "Creative must be JPG, PNG, WEBP, MP4, or MOV.";
    default:
      return "Unsupported file type.";
  }
}

/** For size limits: treat uploads as image vs video. */
export function socialCalendarUploadMediaKind(originalName: string): "image" | "video" | null {
  const ext = extFromName(originalName);
  if (CALENDAR_IMAGE_EXT.has(ext)) return "image";
  if (CALENDAR_VIDEO_EXT.has(ext)) return "video";
  return null;
}

export function uploadRoot(): string {
  return UPLOAD_DIR;
}

export function safeSegment(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "file";
}

export async function saveProjectUpload(
  projectId: string,
  originalName: string,
  data: Buffer,
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, projectId);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}-${safeSegment(originalName)}`;
  const full = path.join(dir, name);
  await writeFile(full, data);
  return `${projectId}/${name}`;
}

export function absoluteUploadPath(relative: string): string {
  const normalized = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(UPLOAD_DIR, normalized);
}
