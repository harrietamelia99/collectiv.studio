import type { ComponentType, SVGProps } from "react";
import {
  HubIconBranding,
  HubIconChecklist,
  HubIconDownload,
  HubIconFolder,
  HubIconGrid,
  HubIconMessages,
  HubIconPayment,
  HubIconRocket,
  HubIconSignage,
  HubIconSocial,
  HubIconWebsite,
} from "@/components/portal/ProjectHubIcons";

/** Icon for hub tiles — lives next to the client tile so we never pass function components from RSC → client. */
export function workflowHubTileIcon(hubKey: string): ComponentType<SVGProps<SVGSVGElement>> {
  switch (hubKey) {
    case "social":
      return HubIconSocial;
    case "website":
      return HubIconWebsite;
    case "branding":
      return HubIconBranding;
    case "signage":
      return HubIconSignage;
    case "deliverables":
      return HubIconFolder;
    case "website-kit":
      return HubIconChecklist;
    case "website-content":
      return HubIconWebsite;
    case "website-preview":
      return HubIconDownload;
    case "website-go-live":
      return HubIconRocket;
    case "social-brief":
      return HubIconChecklist;
    case "social-planning":
      return HubIconSocial;
    case "social-calendar":
      return HubIconDownload;
    case "social-feedback":
      return HubIconMessages;
    case "branding-inspiration":
      return HubIconWebsite;
    case "branding-review":
      return HubIconBranding;
    case "branding-final":
      return HubIconPayment;
    case "signage-review":
      return HubIconSignage;
    case "signage-final":
      return HubIconPayment;
    case "deliverables-review":
      return HubIconFolder;
    case "deliverables-final":
      return HubIconPayment;
    default:
      break;
  }

  if (hubKey.startsWith("wf-")) {
    const slug = hubKey.slice(3);
    switch (slug) {
      case "brand-kit":
        return HubIconChecklist;
      case "content":
        return HubIconWebsite;
      case "preview":
        return HubIconDownload;
      case "domain":
        return HubIconRocket;
      case "inspiration":
        return HubIconWebsite;
      case "questionnaire":
        return HubIconWebsite;
      case "specification":
        return HubIconChecklist;
      case "proofs":
        return HubIconBranding;
      case "final-files":
        return HubIconPayment;
      default:
        return HubIconGrid;
    }
  }

  return HubIconGrid;
}
