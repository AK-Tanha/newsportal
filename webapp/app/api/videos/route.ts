import type { NextRequest } from "next/server";
import { requireAdminMutation, requireRole } from "@/lib/server/auth/auth-guards";
import { videoService } from "@/lib/server/videos/video-service";
import {
  parseBooleanParam,
  parseCreateBody,
  parseCursor,
  parseLimit,
  parseLocale,
  parsePage,
  parseStatus,
  readJsonBody,
} from "@/lib/server/videos/video-parsers";
import {
  MAX_ADMIN_LIMIT,
  MAX_PUBLIC_LIMIT,
  type ListQueryParams,
} from "@/lib/server/videos/video-types";
import { failure, ok } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const locale = parseLocale(params.get("locale"));
    const page = parsePage(params.get("page"));
    const status = parseStatus(params.get("status"));
    const mode: ListQueryParams["mode"] =
      page !== undefined || status !== undefined ? "admin" : "public";
    // Admin-mode lists (drafts, offsets, status filters) require an admin.
    if (mode === "admin") await requireRole(request, "admin");
    const limit = parseLimit(
      params.get("limit"),
      mode === "admin" ? MAX_ADMIN_LIMIT : MAX_PUBLIC_LIMIT,
    );
    const search = params.get("search")?.trim() || undefined;
    const categorySlug = params.get("category")?.trim() || undefined;
    const featured = parseBooleanParam(params.get("featured"), "featured");
    const cursor = mode === "public" ? parseCursor(params.get("cursor")) : undefined;

    const result = await videoService.listVideos({
      locale,
      mode,
      limit,
      page,
      status,
      search,
      categorySlug,
      featured,
      cursor,
    });
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
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const id = await videoService.createVideo(input, { actorId: user.id });
    const detail = await videoService.getVideo(id, locale, { admin: true });
    return ok({ data: detail }, {
      status: 201,
      headers: { Location: `/api/videos/${id}` },
    });
  } catch (error) {
    return failure(error);
  }
}