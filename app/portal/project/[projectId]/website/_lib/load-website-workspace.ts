import type { WebsitePageBrief } from "@prisma/client";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isAgencyPortalSession } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { normalizePortalKind, visiblePortalSections } from "@/lib/portal-project-kind";
import { parseWebsiteFontPaths } from "@/lib/portal-progress";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { parseWebsiteLogoVariations } from "@/lib/website-logo-variations";
import { PORTAL_CLIENT_FORM_WELL_CLASS } from "@/components/portal/PortalSectionCard";
import { parsePageImagePaths, parseWebsitePageLabels } from "@/lib/website-kit-pages";
import {
  mapProjectMessagesForFeedbackThread,
  projectMessageAuthorInclude,
  type FeedbackThreadMessage,
} from "@/lib/project-message-display";

export type WebsiteWorkspaceLoaded =
  | { ok: false; notFound: true }
  | { ok: false; redirectTo: string }
  | {
      ok: true;
      project: NonNullable<Awaited<ReturnType<typeof getProjectForSession>>>;
      studio: boolean;
      unlocked: boolean;
      clientVerified: boolean;
      clientCanEdit: boolean;
      canStudioEditSitemap: boolean;
      canClientEditPageLabels: boolean;
      showWebsitePackageSection: boolean;
      pageBriefs: Awaited<ReturnType<typeof prisma.websitePageBrief.findMany>>;
      messages: FeedbackThreadMessage[];
      pageLabels: string[];
      fonts: string[];
      logoVariations: ReturnType<typeof parseWebsiteLogoVariations>;
      inspirationLinks: ReturnType<typeof parseInspirationLinksJson>;
      sectionVariant: "client";
      formWellClass: string;
    };

export async function loadWebsiteWorkspace(
  projectId: string,
  session: Session | null,
  opts?: { forSignageBrandKit?: boolean; forPrintBrandKit?: boolean },
): Promise<WebsiteWorkspaceLoaded> {
  const project = await getProjectForSession(projectId, session);
  if (!project) return { ok: false, notFound: true };

  const studio = isAgencyPortalSession(session);
  const vis = visiblePortalSections(project.portalKind);
  const isPrint = normalizePortalKind(project.portalKind) === "PRINT";
  const allowWithoutWebsite =
    Boolean(opts?.forSignageBrandKit && vis.signage) || Boolean(opts?.forPrintBrandKit && isPrint);
  if (!vis.website && !studio && !allowWithoutWebsite) {
    return { ok: false, redirectTo: `/portal/project/${project.id}` };
  }

  if (!studio && !clientHasFullPortalAccess(project)) {
    return { ok: false, redirectTo: `/portal/project/${project.id}` };
  }

  const unlocked = studio || clientHasFullPortalAccess(project);
  const clientVerified = clientHasFullPortalAccess(project);
  const clientCanEdit = unlocked && !studio && clientVerified;
  const canStudioEditSitemap = unlocked && studio;
  const canClientEditPageLabels =
    unlocked &&
    !studio &&
    clientVerified &&
    session?.user?.id != null &&
    project.userId === session.user.id;
  const showWebsitePackageSection = canStudioEditSitemap || canClientEditPageLabels;

  for (let i = 0; i < project.websitePageCount; i++) {
    await prisma.websitePageBrief.upsert({
      where: { projectId_pageIndex: { projectId: project.id, pageIndex: i } },
      create: { projectId: project.id, pageIndex: i },
      update: {},
    });
  }

  const [pageBriefs, messages] = await Promise.all([
    prisma.websitePageBrief.findMany({
      where: { projectId: project.id },
      orderBy: { pageIndex: "asc" },
    }),
    prisma.projectMessage.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: projectMessageAuthorInclude,
    }),
  ]);

  const mappedMessages = mapProjectMessagesForFeedbackThread(messages);

  const pageLabels = parseWebsitePageLabels(project.websitePageLabels, project.websitePageCount);
  const fonts = parseWebsiteFontPaths(project.websiteFontPaths);
  const logoVariations = parseWebsiteLogoVariations(project.websiteLogoVariationsJson);
  const inspirationLinks = parseInspirationLinksJson(project.inspirationLinksJson || "[]");

  const base: Extract<WebsiteWorkspaceLoaded, { ok: true }> = {
    ok: true,
    project,
    studio,
    unlocked,
    clientVerified,
    clientCanEdit,
    canStudioEditSitemap,
    canClientEditPageLabels,
    showWebsitePackageSection,
    pageBriefs,
    messages: mappedMessages,
    pageLabels,
    fonts,
    logoVariations,
    inspirationLinks,
    sectionVariant: "client",
    formWellClass: PORTAL_CLIENT_FORM_WELL_CLASS,
  };

  if (opts?.forSignageBrandKit && vis.signage) {
    return {
      ...base,
      canStudioEditSitemap: false,
      canClientEditPageLabels: false,
      showWebsitePackageSection: false,
    };
  }

  if (opts?.forPrintBrandKit && isPrint) {
    return {
      ...base,
      canStudioEditSitemap: false,
      canClientEditPageLabels: false,
      showWebsitePackageSection: false,
    };
  }

  return base;
}


export function briefsForTabs(pageBriefs: WebsitePageBrief[]) {
  return pageBriefs.map((b) => ({
    pageIndex: b.pageIndex,
    headline: b.headline,
    bodyCopy: b.bodyCopy,
    imagePaths: parsePageImagePaths(b.imagePaths),
  }));
}
