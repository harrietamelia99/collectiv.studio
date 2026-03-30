import { normalizePortalKind } from "@/lib/portal-project-kind";

/** Fields needed to decide if a client may use the full project hub (workstreams, uploads, etc.). */
export type ClientPortalAccessFields = {
  portalKind: string;
  clientVerifiedAt: Date | null;
  clientContractSignedAt: Date | null;
  studioDepositMarkedPaidAt: Date | null;
};

/**
 * Full client access if:
 * - Legacy: studio used “Open full client hub” (`clientVerifiedAt`), or
 * - Social-only subscription: contract signed, or
 * - All other types: contract signed **and** deposit marked paid.
 */
export function clientHasFullPortalAccess(project: ClientPortalAccessFields): boolean {
  if (project.clientVerifiedAt) return true;
  const signed = !!project.clientContractSignedAt;
  if (!signed) return false;
  const k = normalizePortalKind(project.portalKind);
  if (k === "SOCIAL") return true;
  return !!project.studioDepositMarkedPaidAt;
}
