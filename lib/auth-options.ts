import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { nextAuthSecret } from "@/lib/nextauth-secret";
import { isStudioUser } from "@/lib/portal-access";

/** Secure cookies require HTTPS; `next start` on http://localhost is still NODE_ENV=production. */
function useSecureNextAuthCookies(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const url = process.env.NEXTAUTH_URL?.trim().toLowerCase() ?? "";
  return url.startsWith("https://");
}

function agencyRoleFromPersona(slug: string | null | undefined): "ISSY" | "HARRIET" | "MAY" | null {
  switch (slug) {
    case "isabella":
      return "ISSY";
    case "harriet":
      return "HARRIET";
    case "may":
      return "MAY";
    default:
      return null;
  }
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
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        if (token.email) session.user.email = token.email as string;
        const email = session.user.email;
        if (email && isStudioUser(email)) {
          session.user.portalRole = "AGENCY";
          const m = await prisma.studioTeamMember.findUnique({
            where: { userId: session.user.id },
            select: { personaSlug: true },
          });
          session.user.agencyRole = agencyRoleFromPersona(m?.personaSlug ?? null);
        } else {
          session.user.portalRole = "CLIENT";
          session.user.agencyRole = null;
        }
      }
      return session;
    },
  },
  secret: nextAuthSecret(),
};
