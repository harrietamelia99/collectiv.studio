import type { DefaultSession } from "next-auth";
import type { AgencyPortalRole } from "@/lib/studio-team-roles";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      /** High-level portal audience (spec: CLIENT vs agency). */
      portalRole: "CLIENT" | "AGENCY";
      /** Issy / Harriet / social manager lane when `portalRole === "AGENCY"`. */
      agencyRole: AgencyPortalRole | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    portalRole?: "CLIENT" | "AGENCY";
    agencyRole?: AgencyPortalRole | null;
  }
}
