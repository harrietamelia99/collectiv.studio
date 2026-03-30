import type { Project, WebsitePageBrief } from "@prisma/client";
import { ClientWorkflowHubTile } from "@/components/portal/ClientWorkflowHubTile";
import type { ClientWorkflowAccessOptions } from "@/lib/portal-brand-kit-gate";
import type { AccountBrandKitSlice } from "@/lib/portal-workflow";
import { buildWebsiteClientHubCards } from "@/lib/portal-progress";

export function WebsiteWorkstreamStepCards({
  projectId,
  project,
  pageBriefs,
  accountKit = null,
  clientWorkflowAccessOpts,
}: {
  projectId: string;
  project: Project;
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[];
  accountKit?: AccountBrandKitSlice;
  clientWorkflowAccessOpts?: ClientWorkflowAccessOptions;
}) {
  const rows = buildWebsiteClientHubCards(
    projectId,
    project,
    pageBriefs,
    false,
    accountKit ?? null,
    clientWorkflowAccessOpts,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((row, i) => (
        <ClientWorkflowHubTile
          key={row.hubKey}
          hubKey={row.hubKey}
          href={row.href}
          title={row.title}
          subtitle={row.subtitle}
          percent={row.percent}
          hint={row.hint}
          stepNumber={i + 1}
          locked={row.locked}
        />
      ))}
    </div>
  );
}
