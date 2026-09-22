import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth/auth-guards";
import { failure, ok } from "@/lib/server/http";

/**
 * GET /api/auth/me
 * Returns the authenticated session user, or 401 when no valid session exists.
 * Never exposes the password hash or session internals.
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    return ok({ data: { user } });
  } catch (error) {
    return failure(error);
  }
}