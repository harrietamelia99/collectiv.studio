import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  HOTELS_PREVIEW_COOKIE,
  hotelsAccessMatchesSecret,
  hotelsExperiencePublic,
  hotelsPreviewSecret,
} from "@/lib/hotels-preview";
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

function hotelsPreviewGate(req: NextRequest): NextResponse {
  if (hotelsExperiencePublic()) return NextResponse.next();

  const isDev = process.env.NODE_ENV === "development";
  if (isDev) return NextResponse.next();

  const secret = hotelsPreviewSecret();
  if (!secret) {
    return new NextResponse(null, { status: 404 });
  }

  const cookie = req.cookies.get(HOTELS_PREVIEW_COOKIE)?.value;
  if (cookie === secret) return NextResponse.next();

  const access = req.nextUrl.searchParams.get("hotelsAccess");
  if (hotelsAccessMatchesSecret(access, secret)) {
    const res = NextResponse.next();
    res.cookies.set(HOTELS_PREVIEW_COOKIE, secret, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }

  return new NextResponse(null, { status: 404 });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/hotels")) {
    return hotelsPreviewGate(req);
  }

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
  matcher: ["/portal", "/portal/:path*", "/hotels", "/hotels/:path*"],
};
