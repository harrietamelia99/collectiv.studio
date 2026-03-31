import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isAgencyPortalSession, studioMemberMayAccessProject } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { visiblePortalSections } from "@/lib/portal-project-kind";
import { parseSocialOnboardingJson } from "@/lib/social-onboarding";
import { socialPlanningHubProgressPercent } from "@/lib/portal-progress";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { SocialContentPlanningForm } from "@/components/portal/SocialContentPlanningForm";
import { SocialWeeklyScheduleEditor } from "@/components/portal/SocialWeeklyScheduleEditor";

type Props = { params: { projectId: string } };

const socialBase = (projectId: string) => `/portal/project/${projectId}/social`;

export default async function SocialContentPlanningPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(params.projectId, session);

  const studio = isAgencyPortalSession(session);
  const vis = visiblePortalSections(project.portalKind);
  if (!vis.social && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  const isSocialOnly = project.portalKind === "SOCIAL";
  const clientVerified = clientHasFullPortalAccess(project);
  const onboardingData = parseSocialOnboardingJson(project.socialOnboardingJson);

  const step1Complete = Boolean(
    onboardingData.businessOverview.trim() &&
      onboardingData.targetAudience.trim() &&
      onboardingData.visualStyle.trim() &&
      onboardingData.inspiringAccounts.trim(),
  );

  const vaultRow =
    !studio
      ? await prisma.project.findUnique({
          where: { id: project.id },
          select: { socialAccountAccessEncrypted: true },
        })
      : null;
  const hasVaultForClient = Boolean(
    studio
      ? project.socialAccountAccessEncrypted?.trim()
      : vaultRow?.socialAccountAccessEncrypted?.trim(),
  );

  const planningPct = socialPlanningHubProgressPercent(project, onboardingData);
  const clientCanEditPlanning =
    !studio && clientVerified && (isSocialOnly ? step1Complete : true);

  const ar = session?.user?.agencyRole ?? null;
  const canEditWeeklySchedule = (() => {
    if (!studio || !session?.user?.id || !ar) return false;
    if (ar !== "ISSY" && ar !== "HARRIET") return false;
    return studioMemberMayAccessProject(project, session.user.id, ar);
  })();

  return (
    <div>
      <Link
        href={socialBase(project.id)}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Social subscription
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Content planning</h1>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-burgundy/70">
        Step 2 for your social subscription — post ideas, promos, and key dates. Optional social logins live at the
        bottom. When you&apos;re ready, open the{" "}
        <Link
          href={`${socialBase(project.id)}/calendar`}
          scroll={false}
          className="font-medium text-burgundy underline decoration-burgundy/25 underline-offset-4 hover:decoration-burgundy/50"
        >
          content calendar
        </Link>{" "}
        to review and approve posts.
      </p>

      <div className="mt-8 max-w-xl">
        <PhaseProgressBar variant="embedded" label="Planning" percent={planningPct} hint="Fills in as you add detail" />
      </div>

      {!studio && clientVerified && isSocialOnly && !step1Complete ? (
        <div className="cc-portal-client-shell mt-10 max-w-xl font-body text-sm leading-relaxed text-burgundy/80">
          <p className="m-0">
            Complete{" "}
            <Link href={`${socialBase(project.id)}#social-step-1`} className="font-medium text-burgundy underline">
              Step 1 — Brief &amp; brand assets
            </Link>{" "}
            first, then come back here to add planning notes and optional account access.
          </p>
        </div>
      ) : (
        <div className="mt-10">
          <SocialContentPlanningForm
            projectId={project.id}
            initial={onboardingData}
            hasSocialAccountVaultStored={hasVaultForClient}
            studioViewer={studio}
            clientCanEdit={clientCanEditPlanning}
          />
        </div>
      )}

      {canEditWeeklySchedule ? (
        <SocialWeeklyScheduleEditor
          projectId={project.id}
          initialJson={project.socialWeeklyScheduleJson || "[]"}
        />
      ) : null}
    </div>
  );
}
