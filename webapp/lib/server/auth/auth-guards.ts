import type { NextRequest } from "next/server";
import { Errors } from "./auth-errors";
import { assertSameSiteOrigin, readSessionToken } from "./auth-session";
import { authService } from "./auth-service";
import type { AuthContext, UserRole } from "./auth-types";

/**
 * Route-handler guards. `requireAuth` proves a session exists; `requireRole`
 * additionally enforces the admin/editor boundary; `requireAdminMutation`
 * adds CSRF origin verification on top for state-changing requests.
 *
 * Usage inside a try/catch (all route handlers already wrap in one):
 *
 *   const { user } = await requireAdmin(request);
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  return authService.authenticate(readSessionToken(request));
}

export async function requireRole(request: NextRequest, role: UserRole): Promise<AuthContext> {
  const context = await requireAuth(request);
  if (context.user.role !== role) throw Errors.forbidden();
  return context;
}

/**
 * Guards a state-changing admin request: valid admin session + the request
 * passes the same-site CSRF origin check. Always throw (never returns a
 * Response) so routes produce the standard { error } body via failure().
 */
export async function requireAdminMutation(request: NextRequest): Promise<AuthContext> {
  if (!assertSameSiteOrigin(request)) throw Errors.forbidden();
  return requireRole(request, "admin");
}