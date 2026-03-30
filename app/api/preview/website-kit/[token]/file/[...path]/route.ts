import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { uploadRoot } from "@/lib/portal-uploads";
import { mimeForUploadPath } from "@/lib/upload-mime";

export async function GET(
  _req: Request,
  context: { params: { token: string; path: string[] } },
) {
  const token = decodeURIComponent(context.params.token ?? "");
  const segments = context.params.path;
  if (!token || !segments?.length) return new Response("Not found", { status: 404 });
  if (!/^[a-f0-9]{32,64}$/i.test(token)) return new Response("Not found", { status: 404 });

  const project = await prisma.project.findUnique({
    where: { websiteKitPreviewToken: token },
    select: {
      id: true,
      portalKind: true,
      clientVerifiedAt: true,
      clientContractSignedAt: true,
      studioDepositMarkedPaidAt: true,
    },
  });
  if (!project || !clientHasFullPortalAccess(project)) return new Response("Not found", { status: 404 });
  /** Path must start with this project id (token already scoped the project — avoid rejecting valid Prisma ids). */
  if (segments[0] !== project.id) {
    return new Response("Not found", { status: 404 });
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
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
