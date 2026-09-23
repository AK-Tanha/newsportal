import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/locales";
import { SESSION_COOKIE_NAME } from "@/lib/server/auth/auth-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
  );
  const isAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginPath = pathname === "/login";
  const isApiPath = pathname === "/api" || pathname.startsWith("/api/");

  // Guard the admin panel: without a session cookie, send to the login form.
  // True session validation still happens server-side per API call; the cookie
  // check here only decides where the browser lands.
  if (isAdminPath && !request.cookies.has(SESSION_COOKIE_NAME)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // /login must never be locale-rewritten (its client fetch targets /api/auth).
  if (hasLocale || isAdminPath || isApiPath || isLoginPath) {
    return NextResponse.next();
  }

  const locale = defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};