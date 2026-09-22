import type { NextRequest } from "next/server";
import { requireAdminMutation, requireRole } from "@/lib/server/auth/auth-guards";
import { adsService } from "@/lib/server/ads/ads-service";
import {
  parseBooleanParam,
  parseCreateBody,
  parseDateParam,
  parseLimit,
  parseLocale,
  parsePage,
  parsePlacementParam,
  parseSearch,
  parseTypeParam,
  readJsonBody,
} from "@/lib/server/ads/ads-parsers";
import {
  MAX_ADMIN_LIMIT,
  MAX_PUBLIC_LIMIT,
  type ListQueryParams,
} from "@/lib/server/ads/ads-types";
import { failure, ok } from "@/lib/server/http";

/**
 * GET /api/ads
 *   - Public:  GET /api/ads?placement=sidebar     -> eligible ads for a placement
 *              GET /api/ads                       -> all currently-eligible ads
 *   - Admin:   any of page/search/type/active/startDate/endDate -> offset page
 *
 * Public responses never contain management fields; they are computed from
 * the same DTO shape minus the admin-only keys.
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const locale = parseLocale(params.get("locale"));
    const placement = parsePlacementParam(params.get("placement"));
    const search = parseSearch(params.get("search"));
    const type = parseTypeParam(params.get("type"));
    const active = parseBooleanParam(params.get("active"), "active");
    const startDate = parseDateParam(params.get("startDate"), "startDate");
    const endDate = parseDateParam(params.get("endDate"), "endDate");
    const page = parsePage(params.get("page"));

    const hasAdminSignal =
      search !== undefined ||
      type !== undefined ||
      active !== undefined ||
      startDate !== undefined ||
      endDate !== undefined ||
      page !== undefined;

    const mode: ListQueryParams["mode"] = hasAdminSignal ? "admin" : "public";
    // Admin-mode listing (offsets, search/filters, inactive/ineligible ads)
    // requires an authenticated admin; an anonymous ?page=1 must not escalate.
    if (mode === "admin") await requireRole(request, "admin");
    const limit = parseLimit(
      params.get("limit"),
      mode === "admin" ? MAX_ADMIN_LIMIT : MAX_PUBLIC_LIMIT,
    );

    const result = await adsService.listAds({
      locale,
      mode,
      limit,
      placement,
      search,
      type,
      active,
      startDate,
      endDate,
      page,
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
    const id = await adsService.createAd(input);
    const detail = await adsService.getAd(id, locale);
    return ok({ data: detail }, {
      status: 201,
      headers: { Location: `/api/ads/${id}` },
    });
  } catch (error) {
    return failure(error);
  }
}