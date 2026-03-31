import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { nextAuthSecret } from "@/lib/nextauth-secret";
import { isEnvListedStudioEmail } from "@/lib/portal-studio-users";
import { agencyPortalRoleFromStudioRole, type AgencyPortalRole } from "@/lib/studio-team-roles";

/** Secure cookies require HTTPS; `next start` on http://localhost is still NODE_ENV=production. */
function useSecureNextAuthCookies(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const url = process.env.NEXTAUTH_URL?.trim().toLowerCase() ?? "";
  return url.startsWith("https://");
}

function agencyRoleForJwt(
  inEnvAllowlist: boolean,
  studioRole: string | null | undefined,
): AgencyPortalRole | null {
  const fromDb = agencyPortalRoleFromStudioRole(studioRole ?? null);
  if (fromDb) return fromDb;
  if (inEnvAllowlist) return "ISSY";
  return null;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  /** Only when the app is served over HTTPS (not local `next start` on http://). */
  useSecureCookies: useSecureNextAuthCookies(),
  pages: { signIn: "/portal/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        /** Passwords must be bcrypt hashes from `bcryptjs`: `await bcrypt.hash(plain, 10)`. */
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    /** Resolve agency role once at sign-in so `/api/auth/session` stays DB-light. */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        const email = user.email?.trim().toLowerCase() ?? "";
        const inEnv = Boolean(email && isEnvListedStudioEmail(email));
        const m = await prisma.studioTeamMember.findUnique({
          where: { userId: user.id },
          select: { studioRole: true },
        });
        if (m || inEnv) {
          token.portalRole = "AGENCY";
          token.agencyRole = agencyRoleForJwt(inEnv, m?.studioRole);
        } else {
          token.portalRole = "CLIENT";
          token.agencyRole = null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.id) return session;
      session.user.id = token.id as string;
      if (token.email) session.user.email = token.email as string;

      if (token.portalRole) {
        session.user.portalRole = token.portalRole as "CLIENT" | "AGENCY";
        session.user.agencyRole = (token.agencyRole as AgencyPortalRole | null) ?? null;
        return session;
      }

      /** Legacy JWTs: fall back to DB once per session fetch. */
      const email = session.user.email?.trim().toLowerCase() ?? "";
      const inEnv = Boolean(email && isEnvListedStudioEmail(email));
      const m = await prisma.studioTeamMember.findUnique({
        where: { userId: session.user.id },
        select: { studioRole: true },
      });
      if (m || inEnv) {
        session.user.portalRole = "AGENCY";
        session.user.agencyRole = agencyRoleForJwt(inEnv, m?.studioRole);
      } else {
        session.user.portalRole = "CLIENT";
        session.user.agencyRole = null;
      }
      return session;
    },
  },
  secret: nextAuthSecret(),
};
