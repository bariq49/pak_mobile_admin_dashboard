import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Helper: Decode JWT safely (Edge runtime compatible) */
function decodeToken(token: string | undefined) {
  if (!token) return null;
  try {
    // JWT structure: header.payload.signature
    // We only need to decode the payload (middle part)
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode base64url encoded payload
    const payload = parts[1];
    // Replace URL-safe base64 characters
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    
    // Decode using atob (available in Edge runtime)
    const decoded = atob(padded);
    return JSON.parse(decoded) as { role?: string } | null;
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
