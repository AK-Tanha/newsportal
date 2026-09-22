import type { NextRequest } from "next/server";
import { requireAdminMutation, requireRole } from "@/lib/server/auth/auth-guards";
import { liveService } from "@/lib/server/live/live-service";
import {
  parseBooleanParam,
  parseCreateBody,
  parseLimit,
  parseLocale,
  parsePage,
  parseStatus,
  readJsonBody,
} from "@/lib/server/live/live-parsers";
import {
  MAX_ADMIN_LIMIT,
  MAX_PUBLIC_LIMIT,
  type ListQueryParams,
} from "@/lib/server/live/live-types";
import { failure, ok } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const locale = parseLocale(params.get("locale"));
    const page = parsePage(params.get("page"));
    const status = parseStatus(params.get("status"));
    const active = parseBooleanParam(params.get("active"), "active");
    const mode: ListQueryParams["mode"] =
      page !== undefined || status !== undefined || active !== undefined
        ? "admin"
        : "public";
    // Admin-mode lists (status/active filters, offsets) require an admin.
    if (mode === "admin") await requireRole(request, "admin");
    const limit = parseLimit(
      params.get("limit"),
      mode === "admin" ? MAX_ADMIN_LIMIT : MAX_PUBLIC_LIMIT,
    );
    const categorySlug = params.get("category")?.trim() || undefined;

    const result = await liveService.listStreams({
      locale,
      mode,
      limit,
      page,
      status,
      active,
      categorySlug,
    });
    return ok(result);
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminMutation(request);
    const body = await readJsonBody(request);
    const input = parseCreateBody(body);
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const id = await liveService.createStream(input);
    const detail = await liveService.getStream(id, locale);
    return ok({ data: detail }, {
      status: 201,
      headers: { Location: `/api/live/${id}` },
    });
  } catch (error) {
    return failure(error);
  }
}