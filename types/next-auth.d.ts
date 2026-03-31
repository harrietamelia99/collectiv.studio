import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      /** High-level portal audience (spec: CLIENT vs agency). */
      portalRole: "CLIENT" | "AGENCY";
      /** Issy / Harriet / May when `portalRole === "AGENCY"` and profile is linked. */
      agencyRole: "ISSY" | "HARRIET" | "MAY" | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    portalRole?: "CLIENT" | "AGENCY";
    agencyRole?: "ISSY" | "HARRIET" | "MAY" | null;
  }
}
