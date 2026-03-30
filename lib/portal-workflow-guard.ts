import { redirect } from "next/navigation";
import type { Project, ReviewAsset, WebsitePageBrief } from "@prisma/client";
import type { ClientWorkflowAccessOptions } from "@/lib/portal-brand-kit-gate";
import {
  clientMayAccessWorkflowStep,
  type AccountBrandKitSlice,
  type WorkflowStream,
} from "@/lib/portal-workflow";

/** Blocks clients from opening a workflow step out of order (studio bypasses). */
export function assertClientWorkflowStepAccess(
  stream: WorkflowStream,
  slug: string,
  project: Project,
  studio: boolean,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  assets: ReviewAsset[],
  accountKit: AccountBrandKitSlice,
  accessOpts?: ClientWorkflowAccessOptions,
): void {
  if (studio) return;
  if (!clientMayAccessWorkflowStep(stream, slug, project, studio, pageBriefs, assets, accountKit, accessOpts)) {
    redirect(`/portal/project/${project.id}`);
  }
}
