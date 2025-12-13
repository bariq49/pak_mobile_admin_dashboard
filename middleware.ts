import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

/* Helper: Decode JWT safely */
function decodeToken(token: string | undefined) {
  if (!token) return null;
  try {
    return jwt.decode(token) as { role?: string } | null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const decoded = decodeToken(token);

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const isRoot = pathname === "/" || pathname === "";

  /* Root redirect */
  if (isRoot) {
    const url = request.nextUrl.clone();
    if (decoded?.role === "admin") {
      url.pathname = "/dashboard";
    } else {
      url.pathname = "/auth/login";
    }
    return NextResponse.redirect(url);
  }

  /* Dashboard access protection */
  if (isDashboard && decoded?.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  /* Prevent logged-in admins from accessing auth pages */
  if (isAuthPage && decoded?.role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/* ⚙️ Matcher Config */
export const config = {
  matcher: [
    "/((?!api|_next|assets|favicon.ico|robots.txt|sitemap.xml|docs|.*\\..*).*)",
  ],
};
