"use client";

import { usePathname } from "next/navigation";
import { ProjectPointOfContact, type ProjectAssigneeForContact } from "@/components/portal/ProjectPointOfContact";

function feedbackMessagesHref(pathname: string, projectId: string): string {
  const base = `/portal/project/${projectId}`;
  if (pathname === base || pathname === `${base}/`) return `${base}#project-messages`;
  if (pathname.startsWith(`${base}/social`)) return `${base}/social#social-feedback`;
  if (pathname.startsWith(`${base}/website`)) return `${base}/website#project-messages`;
  return `${base}#project-messages`;
}

export function ProjectPointOfContactLayoutGate({
  projectId,
  studio,
  assignee,
}: {
  projectId: string;
  studio: boolean;
  assignee: ProjectAssigneeForContact | null;
}) {
  const pathname = usePathname() ?? "";
  if (studio || !assignee) return null;
  const base = `/portal/project/${projectId}`;
  const isOverview = pathname === base || pathname === `${base}/`;
  if (isOverview) return null;
  return (
    <div className="mt-3 max-w-3xl sm:mt-4">
      <ProjectPointOfContact
        assignee={assignee}
        messagesHref={feedbackMessagesHref(pathname, projectId)}
      />
    </div>
  );
}
