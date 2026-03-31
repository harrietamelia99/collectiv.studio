/**
 * Serves **legacy** rows that still store `projectId/...` paths on local disk (`./uploads`).
 * New uploads store UploadThing `https://…` URLs in Prisma; the UI uses those URLs directly (see `portalFilePublicUrl`).
 */
import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getProjectForSession, isStudioUser } from "@/lib/portal-access";
import { clientIsBlockedByPendingOffboarding } from "@/lib/portal-offboarding-gate";
import { prisma } from "@/lib/prisma";
import { uploadRoot } from "@/lib/portal-uploads";
import { isLikelyProjectId } from "@/lib/safe-project-id";
import { mimeForUploadPath } from "@/lib/upload-mime";

export async function GET(
  _req: Request,
  context: { params: { path: string[] } },
) {
  const segments = context.params.path;
  if (!segments?.length) return new Response("Not found", { status: 404 });
  const projectId = segments[0];
  if (!isLikelyProjectId(projectId)) return new Response("Not found", { status: 404 });
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project) return new Response("Not found", { status: 404 });

  const studio = isStudioUser(session?.user?.email);
  if (
    !studio &&
    session?.user?.id &&
    (await clientIsBlockedByPendingOffboarding(projectId, session.user.id))
  ) {
    return new Response("Complete the wrap-up form on the project overview first.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const relativeUploadKey = segments.join("/");
  const signedOffAsset = await prisma.reviewAsset.findFirst({
    where: {
      projectId,
      filePath: relativeUploadKey,
      clientSignedOff: true,
    },
    select: { id: true },
  });
  if (
    signedOffAsset &&
    !studio &&
    !project.clientAcknowledgedFinalPaymentAt
  ) {
    return new Response("Final file downloads unlock after you confirm final payment in the portal.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const root = path.resolve(uploadRoot());
  const filePath = path.resolve(path.join(root, ...segments));
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
