import { redirect } from "next/navigation";
import type { Project } from "@prisma/client";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";

/** Block direct URLs to work areas until contract/deposit (or legacy verify) is satisfied. */
export function redirectClientIfProjectWorkspaceLocked(project: Project, studio: boolean): void {
  if (studio || clientHasFullPortalAccess(project)) return;
  redirect(`/portal/project/${project.id}`);
}
