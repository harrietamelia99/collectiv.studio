import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { nextAuthSecret } from "@/lib/nextauth-secret";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/portal")) return NextResponse.next();
  if (
    pathname === "/portal/login" ||
    pathname === "/portal/register" ||
    pathname === "/portal/forgot-password" ||
    pathname === "/portal/reset-password"
  ) {
    return NextResponse.next();
  }
  const secret = nextAuthSecret();
  if (!secret) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }
  const token = await getToken({ req, secret });
  if (!token) {
    const url = new URL("/portal/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/portal", "/portal/:path*"],
};
