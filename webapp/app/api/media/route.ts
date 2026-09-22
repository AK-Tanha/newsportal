import type { NextRequest } from "next/server";
import { requireAdminMutation, requireRole } from "@/lib/server/auth/auth-guards";
import { mediaService } from "@/lib/server/media/media-service";
import {
  parseLimit,
  parsePage,
  parseSearch,
  parseTypeParam,
  parseCreateBody,
  readJsonBody,
} from "@/lib/server/media/media-parsers";
import { MAX_ADMIN_LIMIT } from "@/lib/server/media/media-types";
import { failure, ok } from "@/lib/server/http";

/**
 * GET /api/media
 *   - Admin library list with optional filters:
 *       ?page=1&limit=20          offset pagination (newest first)
 *       ?search=<text>            ILIKE over filename, alt, url
 *       ?type=image|video         type filter
 *
 * POST /api/media
 *   - Metadata-only creation (no file upload, the URL is never fetched).
 *   - Returns 201 with the created detail.
 *
 * The media library is admin-facing, so there is no public/management
 * distinction — every field is returned on the list.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, "admin");
    const params = request.nextUrl.searchParams;
    const page = parsePage(params.get("page"));
    const limit = parseLimit(params.get("limit"), MAX_ADMIN_LIMIT);
    const search = parseSearch(params.get("search"));
    const type = parseTypeParam(params.get("type"));

    const result = await mediaService.listMedia({ page, limit, search, type });
    return ok(result);
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAdminMutation(request);
    const body = await readJsonBody(request);
    const input = parseCreateBody(body);
    const detail = await mediaService.createMedia(input, { actorId: user.id });
    return ok({ data: detail }, {
      status: 201,
      headers: { Location: `/api/media/${detail.id}` },
    });
  } catch (error) {
    return failure(error);
  }
}