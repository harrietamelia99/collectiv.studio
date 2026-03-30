import { prisma } from "@/lib/prisma";
import { notifyStudioTeamSocialMonthFillReminder } from "@/lib/studio-inbox-notify";
import { formatYm, projectUsesBatchSocialCalendar } from "@/lib/social-batch-calendar";

function daysUntilNextCalendarMonthStart(d = new Date()): number {
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  return Math.ceil((next.getTime() - d.getTime()) / 86_400_000);
}

function nextMonthYmFrom(d = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth();
  if (m === 11) return formatYm(y + 1, 0);
  return formatYm(y, m + 1);
}

/**
 * Within 5 days before the next calendar month: notify the project’s social assignee (or May+Harriet pool)
 * if that month still has AWAITING_CONTENT placeholders. Idempotent per project via `socialMayFillReminderSentYm`.
 */
export async function runSocialUpcomingMonthFillReminders(): Promise<void> {
  const days = daysUntilNextCalendarMonthStart();
  if (days <= 0 || days > 5) return;

  const targetYm = nextMonthYmFrom();

  const projects = await prisma.project.findMany({
    where: {
      portalKind: "SOCIAL",
      NOT: { socialMayFillReminderSentYm: targetYm },
    },
    select: {
      id: true,
      name: true,
      socialWeeklyScheduleJson: true,
    },
  });

  for (const p of projects) {
    if (!projectUsesBatchSocialCalendar(p.socialWeeklyScheduleJson)) continue;
    const awaitingContent = await prisma.contentCalendarItem.count({
      where: {
        projectId: p.id,
        planMonthKey: targetYm,
        postWorkflowStatus: "AWAITING_CONTENT",
      },
    });
    const draftNotSubmitted = await prisma.contentCalendarItem.count({
      where: {
        projectId: p.id,
        planMonthKey: targetYm,
        postWorkflowStatus: "DRAFT",
      },
    });
    const awaiting = awaitingContent + draftNotSubmitted;
    if (awaiting === 0) {
      await prisma.project.update({
        where: { id: p.id },
        data: { socialMayFillReminderSentYm: targetYm },
      });
      continue;
    }

    await notifyStudioTeamSocialMonthFillReminder(p.id, p.name, targetYm, awaiting);
    await prisma.project.update({
      where: { id: p.id },
      data: { socialMayFillReminderSentYm: targetYm },
    });
  }
}
