import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import jwt from "jsonwebtoken";

/* Supported Locales */
const locales = ["en", "ar", "bn"];
const defaultLocale = "en";

/* Helper: Detect the user’s preferred language */
function getLocale(request: NextRequest) {
  const acceptedLanguage = request.headers.get("accept-language") ?? "";
  const headers = { "accept-language": acceptedLanguage };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
}

/* Helper: Decode JWT safely */
function decodeToken(token: string | undefined) {
  if (!token) return null;
  try {
    return jwt.decode(token) as { role?: string } | null;
  } catch {
    return null;
  }
}
/* Helper: Remove locale prefix from pathname */
function stripLocale(pathname: string) {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.replace(`/${locale}`, "");
    }
    if (pathname === `/${locale}`) {
      return "/";
    }
  }
  return pathname;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const decoded = decodeToken(token);

  const pathnameWithoutLocale = stripLocale(pathname);
  const isAuthPage = pathnameWithoutLocale.startsWith("/auth");
  const isDashboard = pathnameWithoutLocale.startsWith("/dashboard");
  const isRoot = pathnameWithoutLocale === "/" || pathnameWithoutLocale === "";

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

  /* Locale redirect */
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
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
