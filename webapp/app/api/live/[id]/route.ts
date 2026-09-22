import type { NextRequest } from "next/server";
import { requireAdminMutation } from "@/lib/server/auth/auth-guards";
import { liveService } from "@/lib/server/live/live-service";
import {
  parseLiveId,
  parseLocale,
  parseUpdateBody,
  readJsonBody,
} from "@/lib/server/live/live-parsers";
import { failure, noContent, ok } from "@/lib/server/http";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const detail = await liveService.getStream(parseLiveId(id), locale);
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    const parsedId = parseLiveId(id);
    const body = await readJsonBody(request);
    const patch = parseUpdateBody(body);
    await liveService.updateStream(parsedId, patch);
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const detail = await liveService.getStream(parsedId, locale);
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    await liveService.deleteStream(parseLiveId(id));
    return noContent();
  } catch (error) {
    return failure(error);
  }
}