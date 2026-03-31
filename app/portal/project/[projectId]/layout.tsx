import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getProjectForSession, isAgencyPortalSession } from "@/lib/portal-access";
import { ProjectPointOfContactLayoutGate } from "@/components/portal/ProjectPointOfContactLayoutGate";

type Props = { children: React.ReactNode; params: { projectId: string } };

export default async function ProjectWorkspaceLayout({ children, params }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  const studio = isAgencyPortalSession(session);
  const raw = project?.assignedStudioUser;
  const assignee = raw
    ? {
        id: raw.id,
        email: raw.email,
        name: raw.name,
        studioTeamProfile: raw.studioTeamProfile,
      }
    : null;

  return (
    <>
      <ProjectPointOfContactLayoutGate projectId={params.projectId} studio={studio} assignee={assignee} />
      {children}
    </>
  );
}
