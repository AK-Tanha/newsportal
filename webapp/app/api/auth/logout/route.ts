import type { NextRequest } from "next/server";
import { clearSessionCookieHeader, readSessionToken } from "@/lib/server/auth/auth-session";
import { authService } from "@/lib/server/auth/auth-service";
import { failure, noContent } from "@/lib/server/http";

/**
 * POST /api/auth/logout
 * Invalidates the current session server-side and clears the session cookie.
 * Always returns 204, even when already logged out (no session / dead token).
 */
export async function POST(request: NextRequest) {
  try {
    const token = readSessionToken(request);
    await authService.logout(token);
    return noContent({ headers: { "Set-Cookie": clearSessionCookieHeader() } });
  } catch (error) {
    return failure(error);
  }
}