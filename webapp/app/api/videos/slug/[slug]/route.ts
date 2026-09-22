import type { NextRequest } from "next/server";
import { videoService } from "@/lib/server/videos/video-service";
import { parseLocale, parseSlugParam } from "@/lib/server/videos/video-parsers";
import { failure, ok } from "@/lib/server/http";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const detail = await videoService.getVideoBySlug(parseSlugParam(slug), locale);
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}