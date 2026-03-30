/** Signed-off review assets are treated as final deliverables; clients must confirm payment before downloading. */
export function isFinalDesignFileDownloadLocked(
  asset: { clientSignedOff: boolean; filePath: string | null },
  project: { clientAcknowledgedFinalPaymentAt: Date | null },
  studio: boolean,
): boolean {
  if (studio) return false;
  if (!asset.filePath || !asset.clientSignedOff) return false;
  return !project.clientAcknowledgedFinalPaymentAt;
}

export function hasLockedFinalDesignFiles(
  assets: { clientSignedOff: boolean; filePath: string | null }[],
  project: { clientAcknowledgedFinalPaymentAt: Date | null },
  studio: boolean,
): boolean {
  return assets.some((a) => isFinalDesignFileDownloadLocked(a, project, studio));
}
