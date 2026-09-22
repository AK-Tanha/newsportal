import type { NextRequest } from "next/server";
import { liveService } from "@/lib/server/live/live-service";
import { parseLocale } from "@/lib/server/live/live-parsers";
import { failure, ok } from "@/lib/server/http";

/**
 * Public active-stream endpoint. A static segment, so Next.js resolves it
 * before the dynamic /api/live/[id] route.
 */
export async function GET(request: NextRequest) {
  try {
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const result = await liveService.getActiveStream(locale);
    return ok(result);
  } catch (error) {
    return failure(error);
  }
}