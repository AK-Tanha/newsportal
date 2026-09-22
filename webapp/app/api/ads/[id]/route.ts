import type { NextRequest } from "next/server";
import { requireAdminMutation } from "@/lib/server/auth/auth-guards";
import { adsService } from "@/lib/server/ads/ads-service";
import {
  parseAdId,
  parseLocale,
  parseUpdateBody,
  readJsonBody,
} from "@/lib/server/ads/ads-parsers";
import { failure, noContent, ok } from "@/lib/server/http";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const detail = await adsService.getAd(parseAdId(id), locale);
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    const parsedId = parseAdId(id);
    const body = await readJsonBody(request);
    const patch = parseUpdateBody(body);
    await adsService.updateAd(parsedId, patch);
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const detail = await adsService.getAd(parsedId, locale);
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    await adsService.deleteAd(parseAdId(id));
    return noContent();
  } catch (error) {
    return failure(error);
  }
}