"use client";

import { useMemo, type ReactNode } from "react";
import {
  saveBrandingMoodDescription,
  saveProjectInspirationLinks,
  saveSocialContentPlanning,
  saveSocialOnboarding,
  saveWebsiteColours,
  toggleWebsiteContentSignedOff,
  toggleWebsiteKitSignedOff,
  toggleWebsiteLaunchSignedOff,
  toggleWebsitePreviewSignedOff,
} from "@/app/portal/actions";
import type { PortalFormFlash } from "@/lib/portal-form-flash";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";

export function PortalSaveWebsiteColoursForm({
  projectId,
  id,
  className,
  children,
}: {
  projectId: string;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveWebsiteColours(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash id={id} action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export type WebsiteSignOffStep = "kit" | "content" | "preview" | "launch";

export function PortalWebsiteSignOffForm({
  projectId,
  step,
  next,
  className,
  children,
}: {
  projectId: string;
  step: WebsiteSignOffStep;
  next: boolean;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(() => {
    const run =
      step === "kit"
        ? toggleWebsiteKitSignedOff
        : step === "content"
          ? toggleWebsiteContentSignedOff
          : step === "preview"
            ? toggleWebsitePreviewSignedOff
            : toggleWebsiteLaunchSignedOff;
    return async (_prev: PortalFormFlash | null, fd: FormData) => run(projectId, next, fd);
  }, [projectId, step, next]);
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalSocialOnboardingBriefForm({
  projectId,
  id,
  className,
  children,
}: {
  projectId: string;
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveSocialOnboarding(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash id={id} action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalSocialContentPlanningForm({
  projectId,
  className,
  children,
}: {
  projectId: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveSocialContentPlanning(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalInspirationLinksSaveForm({
  projectId,
  className,
  children,
}: {
  projectId: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveProjectInspirationLinks(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalBrandingMoodForm({
  projectId,
  className,
  children,
}: {
  projectId: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveBrandingMoodDescription(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}
