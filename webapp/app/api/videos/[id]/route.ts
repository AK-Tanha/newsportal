import type { NextRequest } from "next/server";
import { requireAdminMutation, requireRole } from "@/lib/server/auth/auth-guards";
import { videoService } from "@/lib/server/videos/video-service";
import {
  parseLocale,
  parseUpdateBody,
  parseVideoId,
  readJsonBody,
} from "@/lib/server/videos/video-parsers";
import { failure, noContent, ok } from "@/lib/server/http";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));

    // Detail-by-id no longer leaks drafts publicly. Only an authenticated
    // admin may view a drafted video; every other caller (anonymous,
    // expired session, editor) gets the public view, which is limited to
    // published videos and returns 404 for soft-deleted ones.
    let admin = false;
    try {
      await requireRole(request, "admin");
      admin = true;
    } catch {
      admin = false;
    }

    const detail = await videoService.getVideo(parseVideoId(id), locale, { admin });
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    const parsedId = parseVideoId(id);
    const body = await readJsonBody(request);
    const patch = parseUpdateBody(body);
    await videoService.updateVideo(parsedId, patch);
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const detail = await videoService.getVideo(parsedId, locale, { admin: true });
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    await videoService.deleteVideo(parseVideoId(id));
    return noContent();
  } catch (error) {
    return failure(error);
  }
}