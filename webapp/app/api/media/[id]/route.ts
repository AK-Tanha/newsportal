import type { NextRequest } from "next/server";
import { requireAdminMutation, requireRole } from "@/lib/server/auth/auth-guards";
import { mediaService } from "@/lib/server/media/media-service";
import {
  parseMediaId,
  parseUpdateBody,
  readJsonBody,
} from "@/lib/server/media/media-parsers";
import { failure, noContent, ok } from "@/lib/server/http";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/media/:id          -> detail incl. usage (reference counts)
 * PATCH /api/media/:id        -> update mutable metadata
 * DELETE /api/media/:id       -> hard delete; referenced columns become NULL
 *                                (all media FKs are ON DELETE SET NULL)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(request, "admin");
    const { id } = await context.params;
    const detail = await mediaService.getMedia(parseMediaId(id));
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    const parsedId = parseMediaId(id);
    const body = await readJsonBody(request);
    const patch = parseUpdateBody(body);
    const detail = await mediaService.updateMedia(parsedId, patch);
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    await mediaService.deleteMedia(parseMediaId(id));
    return noContent();
  } catch (error) {
    return failure(error);
  }
}