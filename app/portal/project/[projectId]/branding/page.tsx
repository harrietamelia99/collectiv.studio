import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getProjectForSession, isStudioUser } from "@/lib/portal-access";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { visiblePortalSections } from "@/lib/portal-project-kind";

type Props = { params: { projectId: string } };

/** Branding work is split into step routes under `/branding/[step]`. */
export default async function ProjectBrandingHubRedirect({ params }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(params.projectId, session);

  const studio = isStudioUser(session?.user?.email);
  if (!visiblePortalSections(project.portalKind).branding && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirect(`/portal/project/${project.id}/branding/inspiration`);
}
