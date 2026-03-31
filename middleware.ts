import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { PORTAL_AUTH_SHELL_HEADER } from "@/lib/portal-auth-shell-header";
import { nextAuthSecret } from "@/lib/nextauth-secret";

function isPortalPublicAuthPath(pathname: string) {
  return (
    pathname === "/portal/login" ||
    pathname === "/portal/register" ||
    pathname === "/portal/register/success" ||
    pathname === "/portal/forgot-password" ||
    pathname === "/portal/reset-password" ||
    /** Invite links must work while logged out; token lives in the query string. */
    pathname === "/portal/invite"
  );
}

/** Lets `app/portal/layout` skip DB + heavy chrome on sign-in pages (faster first paint). */
function nextWithPortalAuthShell(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(PORTAL_AUTH_SHELL_HEADER, "1");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/portal")) return NextResponse.next();
  if (isPortalPublicAuthPath(pathname)) {
    return nextWithPortalAuthShell(req);
  }
  const secret = nextAuthSecret();
  if (!secret) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }
  const token = await getToken({ req, secret });
  if (!token) {
    const url = new URL("/portal/login", req.url);
    const pathWithSearch = `${pathname}${req.nextUrl.search}`;
    /** Preserve e.g. `?token=` on invite or deep links; only same-origin relative paths. */
    if (pathWithSearch.startsWith("/portal") && pathWithSearch !== "/portal/login") {
      url.searchParams.set("callbackUrl", pathWithSearch);
    }
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/portal", "/portal/:path*"],
};
