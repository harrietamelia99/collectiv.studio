/**
 * UploadThing SDK v7+: authenticate with `UPLOADTHING_TOKEN` only (`UTApi` defaults to `process.env.UPLOADTHING_TOKEN`).
 * Next.js adapters live in the `uploadthing` package at `uploadthing/next` — there is no separate `@uploadthing/next` npm package.
 */
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi, UTFile, UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

let utapiSingleton: UTApi | null = null;

/** True when server-side uploads can run (UTApi). */
export function uploadthingConfigured(): boolean {
  return Boolean(process.env.UPLOADTHING_TOKEN?.trim());
}

export function getUtapi(): UTApi {
  if (!utapiSingleton) {
    const token = process.env.UPLOADTHING_TOKEN?.trim();
    if (!token) {
      throw new Error("UPLOADTHING_TOKEN is not set — add it from uploadthing.com dashboard (API keys).");
    }
    utapiSingleton = new UTApi({ token });
  }
  return utapiSingleton;
}

function uploadThingFailureMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return String(err);
}

/**
 * Upload a buffer from server actions (portal). Returns the public URL stored in Prisma (`ufsUrl` preferred).
 */
export async function uploadBufferToUploadThing(originalName: string, data: Buffer): Promise<string> {
  const utapi = getUtapi();
  const file = new UTFile([new Uint8Array(data)], originalName);
  const res = await utapi.uploadFiles(file);
  const row = Array.isArray(res) ? res[0] : res;
  if (!row || typeof row !== "object") {
    throw new Error("UploadThing returned an unexpected response");
  }
  if ("error" in row && row.error != null) {
    throw new Error(uploadThingFailureMessage(row.error) || "UploadThing upload failed");
  }
  const payload = "data" in row ? row.data : null;
  if (!payload || typeof payload !== "object") {
    throw new Error("UploadThing returned no file data");
  }
  const d = payload as Record<string, unknown>;
  const candidates = [d.ufsUrl, d.url, d.appUrl];
  const url = candidates.find((x) => typeof x === "string" && x.trim().length > 0) as string | undefined;
  if (!url) {
    throw new Error("UploadThing succeeded but returned no public URL (missing ufsUrl / url)");
  }
  return url.trim();
}

/** Extract file key from a stored ufs/app URL for `deleteFiles`. */
export function uploadThingFileKeyFromStoredUrl(stored: string): string | null {
  const s = stored.trim();
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    const u = new URL(s);
    const m = u.pathname.match(/\/f\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

export async function deleteUploadThingFileByStoredValue(stored: string | null | undefined): Promise<void> {
  if (!stored?.trim()) return;
  const key = uploadThingFileKeyFromStoredUrl(stored.trim());
  if (!key || !uploadthingConfigured()) return;
  try {
    await getUtapi().deleteFiles(key);
  } catch {
    /* non-fatal — file may already be gone */
  }
}

const f = createUploadthing();

/**
 * Client-accessible routes (optional — portal uploads use UTApi server-side).
 * Restricts types to match product rules: raster, video, brand vectors (SVG/PDF), PDF-only.
 */
export const uploadthingFileRouter = {
  portalImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 8 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new UploadThingError("You must be signed in to upload.");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { ufsUrl: file.ufsUrl };
    }),

  portalVideo: f({
    video: { maxFileSize: "1GB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new UploadThingError("You must be signed in to upload.");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { ufsUrl: file.ufsUrl };
    }),

  /** SVG (image/svg+xml) + PDF for brand kit / logo vectors. */
  portalBrandVector: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new UploadThingError("You must be signed in to upload.");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { ufsUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadthingFileRouter = typeof uploadthingFileRouter;
