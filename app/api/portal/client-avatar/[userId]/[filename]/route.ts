import { readFile } from "fs/promises";
import path from "path";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { isAgencyPortalSession } from "@/lib/portal-access";
import { prisma } from "@/lib/prisma";
import { uploadRoot } from "@/lib/portal-uploads";
import { mimeForUploadPath } from "@/lib/upload-mime";

async function mayReadClientAvatar(session: Session | null, targetUserId: string): Promise<boolean> {
  if (!session?.user?.id) return false;
  if (session.user.id === targetUserId) return true;
  if (!isAgencyPortalSession(session)) return false;
  const row = await prisma.project.findFirst({
    where: { userId: targetUserId },
    select: { id: true },
  });
  return Boolean(row);
}

export async function GET(
  _req: Request,
  context: { params: { userId: string; filename: string } },
) {
  const userId = context.params.userId;
  const filename = context.params.filename;
  if (!userId?.trim() || !filename?.trim()) return new Response("Not found", { status: 404 });
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new Response("Not found", { status: 404 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Not found", { status: 404 });

  const ok = await mayReadClientAvatar(session, userId);
  if (!ok) return new Response("Not found", { status: 404 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePhotoPath: true },
  });
  const expected = user?.profilePhotoPath?.trim();
  if (!expected) return new Response("Not found", { status: 404 });

  if (/^https?:\/\//i.test(expected)) {
    try {
      const u = new URL(expected);
      const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
      if (decodeURIComponent(last) !== decodeURIComponent(filename)) {
        return new Response("Not found", { status: 404 });
      }
    } catch {
      return new Response("Not found", { status: 404 });
    }
    return Response.redirect(expected, 302);
  }

  const base = path.basename(expected);
  if (base !== filename) return new Response("Not found", { status: 404 });

  const root = path.resolve(uploadRoot());
  const filePath = path.resolve(path.join(root, ...expected.split("/").filter(Boolean)));
  if (!filePath.startsWith(root + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const buf = await readFile(filePath);
    return new Response(buf, {
      headers: {
        "Content-Type": mimeForUploadPath(filePath),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
