/** Fields needed to decide if a client may use the full project hub (workstreams, uploads, etc.). */
export type ClientPortalAccessFields = {
  portalKind: string;
  clientVerifiedAt: Date | null;
  clientContractSignedAt: Date | null;
  studioDepositMarkedPaidAt: Date | null;
  /** Set when Issy uses “Unlock workspace & notify client” (or optional DB backfill). */
  workspaceUnlockedAt?: Date | null;
};

/**
 * Full client hub access if:
 * - Legacy: `clientVerifiedAt` (“Open full client hub”), or
 * - Issy unlocked workspace (`workspaceUnlockedAt`) after contract + deposit rules were satisfied.
 *
 * Contract and deposit are prerequisites for the unlock action on the agency side, not automatic gates here.
 */
export function clientHasFullPortalAccess(project: ClientPortalAccessFields): boolean {
  if (project.clientVerifiedAt) return true;
  if (project.workspaceUnlockedAt) return true;
  return false;
}
