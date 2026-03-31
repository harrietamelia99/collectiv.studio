import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getProjectForSession, isAgencyPortalSession } from "@/lib/portal-access";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { visiblePortalSections } from "@/lib/portal-project-kind";

type Props = { params: { projectId: string } };

/** Canonical route: `/branding/final-files`. */
export default async function ProjectBrandingDownloadsLegacyRedirect({ params }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(params.projectId, session);

  const studio = isAgencyPortalSession(session);
  if (!visiblePortalSections(project.portalKind).branding && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  redirect(`/portal/project/${project.id}/branding/final-files`);
}
