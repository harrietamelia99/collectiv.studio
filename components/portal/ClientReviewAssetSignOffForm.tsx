"use client";

import { useMemo } from "react";
import { signOffReviewAsset } from "@/app/portal/actions";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import type { PortalFormFlash } from "@/lib/portal-form-flash";
import type { CtaVariant } from "@/components/ui/Button";

export function ClientReviewAssetSignOffForm({
  projectId,
  assetId,
  className = "",
  variant = "burgundy" as CtaVariant,
  idleLabel = "Sign off",
  pendingLabel = "Signing off…",
  successLabel = "Signed off ✓",
}: {
  projectId: string;
  assetId: string;
  className?: string;
  variant?: CtaVariant;
  idleLabel?: string;
  pendingLabel?: string;
  successLabel?: string;
}) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => signOffReviewAsset(fd),
    [],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="assetId" value={assetId} />
      <PortalFormSubmitButton
        idleLabel={idleLabel}
        pendingLabel={pendingLabel}
        successLabel={successLabel}
        errorFallback="Couldn’t sign off. Try again."
        variant={variant}
        size="sm"
        className="w-full md:w-auto"
      />
    </PortalFormWithFlash>
  );
}
