"use client";

import { useMemo, type ReactNode } from "react";
import { addReviewAsset } from "@/app/portal/actions";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import type { PortalFormFlash } from "@/lib/portal-form-flash";
import type { CtaSize, CtaVariant } from "@/components/ui/Button";

export function StudioAddReviewAssetForm({
  className,
  children,
  idleLabel = "Add deliverable",
  pendingLabel = "Uploading…",
  successLabel = "Proof uploaded ✓",
  variant = "burgundy" as CtaVariant,
  size = "sm" as CtaSize,
}: {
  className?: string;
  children: ReactNode;
  idleLabel?: string;
  pendingLabel?: string;
  successLabel?: string;
  variant?: CtaVariant;
  size?: CtaSize;
}) {
  const action = useMemo(
    () => async (_p: PortalFormFlash | null, fd: FormData) => addReviewAsset(fd),
    [],
  );
  return (
    <PortalFormWithFlash action={action} encType="multipart/form-data" className={className}>
      {children}
      <PortalFormSubmitButton
        idleLabel={idleLabel}
        pendingLabel={pendingLabel}
        successLabel={successLabel}
        errorFallback="Upload failed - try again"
        variant={variant}
        size={size}
        className="w-fit"
      />
    </PortalFormWithFlash>
  );
}
