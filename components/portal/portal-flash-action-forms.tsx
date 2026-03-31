"use client";

import { useMemo, type ReactNode } from "react";
import {
  applyUserBrandKitToProject,
  saveBrandingMoodDescription,
  savePrintSpecification,
  saveProjectInspirationLinks,
  saveSignageSpecification,
  saveSocialContentPlanning,
  saveSocialOnboarding,
  saveUserBrandKitFromProject,
  saveWebsiteColours,
  saveWebsitePageBrief,
  saveWebsiteDomainLaunchDetails,
  setWebsiteLiveUrl,
  setWebsiteSitemap,
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

export function PortalSavePrintSpecificationForm({
  projectId,
  className,
  children,
}: {
  projectId: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => savePrintSpecification(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalSaveSignageSpecificationForm({
  projectId,
  className,
  children,
}: {
  projectId: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveSignageSpecification(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalSaveWebsiteDomainForm({
  projectId,
  className,
  children,
}: {
  projectId: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveWebsiteDomainLaunchDetails(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalSetWebsiteLiveUrlForm({
  projectId,
  className,
  children,
}: {
  projectId: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => setWebsiteLiveUrl(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalSetWebsiteSitemapForm({
  projectId,
  className,
  children,
}: {
  projectId: string;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => setWebsiteSitemap(projectId, fd),
    [projectId],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalSaveUserBrandKitForm({ className, children }: { className?: string; children: ReactNode }) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveUserBrandKitFromProject(fd),
    [],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalApplyUserBrandKitForm({ className, children }: { className?: string; children: ReactNode }) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => applyUserBrandKitToProject(fd),
    [],
  );
  return (
    <PortalFormWithFlash action={action} className={className}>
      {children}
    </PortalFormWithFlash>
  );
}

export function PortalSaveWebsitePageBriefForm({
  projectId,
  pageIndex,
  className,
  children,
}: {
  projectId: string;
  pageIndex: number;
  className?: string;
  children: ReactNode;
}) {
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => saveWebsitePageBrief(projectId, pageIndex, fd),
    [projectId, pageIndex],
  );
  return (
    <PortalFormWithFlash action={action} encType="multipart/form-data" className={className}>
      {children}
    </PortalFormWithFlash>
  );
}
