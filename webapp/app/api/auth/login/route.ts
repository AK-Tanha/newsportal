import type { NextRequest } from "next/server";
import { Errors } from "@/lib/server/auth/auth-errors";
import { sessionCookieHeader } from "@/lib/server/auth/auth-session";
import { authService } from "@/lib/server/auth/auth-service";
import { failure, ok } from "@/lib/server/http";

/**
 * POST /api/auth/login
 * Input:  { "email": "...", "password": "..." }
 * Output: 200 { "data": { "user": { id, email, fullName, role } } }
 *          + Set-Cookie installs the HttpOnly session cookie.
 *
 * The response never contains the password hash, the session token, or any
 * session internals.
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => {
      throw Errors.invalidLogin([{ field: "body", issues: ["Must be a JSON object."] }]);
    });
    const input = (body ?? {}) as { email?: string; password?: string };
    const { user, token } = await authService.login(input);
    return ok(
      { data: { user } },
      { headers: { "Set-Cookie": sessionCookieHeader(token) } },
    );
  } catch (error) {
    return failure(error);
  }
}