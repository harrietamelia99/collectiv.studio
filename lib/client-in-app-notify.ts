import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createClientInAppNotification(input: {
  userId: string;
  projectId?: string | null;
  kind: string;
  title: string;
  body?: string;
  href?: string | null;
}): Promise<void> {
  await prisma.clientNotification.create({
    data: {
      userId: input.userId,
      projectId: input.projectId ?? null,
      kind: input.kind,
      title: input.title,
      body: input.body ?? "",
      href: input.href ?? null,
    },
  });
  revalidatePath("/portal");
  revalidatePath("/portal/notifications");
}

/** Resolve owning user for a project (registered client only). */
export async function createClientInAppNotificationForProject(
  projectId: string,
  payload: { kind: string; title: string; body?: string; href?: string | null },
): Promise<void> {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  if (!p?.userId) return;
  await createClientInAppNotification({
    userId: p.userId,
    projectId,
    ...payload,
  });
}
