import type { NextRequest } from "next/server";
import { requireAdminMutation } from "@/lib/server/auth/auth-guards";
import { settingsService } from "@/lib/server/settings/settings-service";
import { parseUpdateBody, readJsonBody } from "@/lib/server/settings/settings-parsers";
import { failure, ok } from "@/lib/server/http";

/**
 * GET /api/settings
 *   Returns the singleton site settings record. These fields are public site
 *   branding/SEO configuration (no secrets, no audit columns exposed), so the
 *   read stays public for the site's public configuration needs.
 *
 * PATCH /api/settings
 *   Authenticated admin only (mutation). Partial update. Omitted fields keep
 *   their current value; nullable fields accept null (or "") to clear them.
 *   Unknown and forbidden keys (id, createdAt, updatedAt, updatedBy) are
 *   ignored. updatedById is stamped from the session, never from the client.
 *   Returns the updated record.
 *
 * There is deliberately no /api/settings/[id]: site_settings is a singleton
 * (id = 1) enforced by ck_site_settings_single_row.
 */
export async function GET() {
  try {
    const data = await settingsService.getSettings();
    return ok({ data });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireAdminMutation(request);
    const body = await readJsonBody(request);
    const input = parseUpdateBody(body);
    const data = await settingsService.updateSettings(input, { actorId: user.id });
    return ok({ data });
  } catch (error) {
    return failure(error);
  }
}