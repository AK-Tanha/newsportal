import type { NextRequest } from "next/server";
import { DEFAULT_SESSION_TTL_DAYS } from "./auth-types";

export const SESSION_COOKIE_NAME = "rudro_admin_session";
const COOKIE_PATH = "/";

export function sessionTtlSeconds(): number {
  const raw = process.env.SESSION_TTL_DAYS;
  const parsed = raw ? Number(raw) : Number.NaN;
  return (Number.isInteger(parsed) && parsed >= 1 ? parsed : DEFAULT_SESSION_TTL_DAYS) * 86400;
}

/**
 * Secure flag is environment-aware: on in production, off in dev. The
 * SESSION_COOKIE_SECURE env var can force either value explicitly.
 */
function isCookieSecure(): boolean {
  const override = process.env.SESSION_COOKIE_SECURE;
  if (override !== undefined) {
    return override === "true" || override === "1";
  }
  return process.env.NODE_ENV === "production";
}

/**
 * SameSite=Lax is the primary CSRF defense: browsers only attach the cookie
 * to same-site requests, so cross-site POST/PATCH/DELETE cannot carry it.
 * Lax (rather than Strict) keeps top-level navigations to the site usable.
 */
function secureCookieAttributes(): { secure: string; sameSite: string } {
  return {
    secure: isCookieSecure() ? "Secure; " : "",
    sameSite: "Lax",
  };
}

/** Set-Cookie header value that installs the session cookie. */
export function sessionCookieHeader(token: string): string {
  const { secure, sameSite } = secureCookieAttributes();
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    `Max-Age=${sessionTtlSeconds()}`,
    `Path=${COOKIE_PATH}`,
    "HttpOnly",
    secure,
    `SameSite=${sameSite}`,
  ]
    .filter(Boolean)
    .join("; ");
}

/** Set-Cookie header value that removes the session cookie (Max-Age=0). */
export function clearSessionCookieHeader(): string {
  const { secure, sameSite } = secureCookieAttributes();
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Max-Age=0",
    `Path=${COOKIE_PATH}`,
    "HttpOnly",
    secure,
    `SameSite=${sameSite}`,
  ]
    .filter(Boolean)
    .join("; ");
}

/** Reads the raw session token from the incoming request cookies. */
export function readSessionToken(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * CSRF defense-in-depth for cookie-authenticated mutations. SameSite=Lax
 * already stops cross-site cookies; this additionally rejects any mutating
 * request whose Origin header does not match our own host (or an explicit
 * AUTH_ALLOWED_ORIGINS allowlist). Requests without an Origin header (curl,
 * server-to-server, non-browser clients) are not CSRF-capable and pass.
 */
export function assertSameSiteOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowlist = (process.env.AUTH_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowlist.includes(origin)) return true;

  const host = request.headers.get("host");
  if (!host) return false;
  try {
    const parsed = new URL(origin);
    return parsed.host === host;
  } catch {
    return false;
  }
}