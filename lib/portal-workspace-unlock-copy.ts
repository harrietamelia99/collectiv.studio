import { normalizePortalKind } from "@/lib/portal-project-kind";

/** Next-step paragraph for the client workspace-unlock email (by portal layout). */
export function workspaceUnlockNextStepParagraph(portalKindRaw: string): string {
  const k = normalizePortalKind(portalKindRaw);
  switch (k) {
    case "WEBSITE":
      return "To get started, please fill out your brand kit with your colours, fonts and logo files, then move on to your website content.";
    case "BRANDING":
      return "To get started, please upload your inspiration and complete your brand questionnaire - this helps us understand your vision before we begin.";
    case "SIGNAGE":
      return "To get started, please attach your brand kit and upload any inspiration for your signage.";
    case "PRINT":
      return "To get started, please attach your brand kit and fill out your print specification form.";
    case "SOCIAL":
      return "To get started, please upload your brand assets so we can begin planning your content.";
    default:
      return "To get started, open your project page and follow the quick guide — it lists the best order to work through your hubs.";
  }
}
