import type { NextRequest } from "next/server";
import { requireAdminMutation, requireRole } from "@/lib/server/auth/auth-guards";
import { articleService } from "@/lib/server/articles/article-service";
import {
  parseArticleId,
  parseLocale,
  parseUpdateBody,
  readJsonBody,
} from "@/lib/server/articles/article-parsers";
import { failure, noContent, ok } from "@/lib/server/articles/http";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));

    // Detail-by-id no longer leaks drafts publicly. Only an authenticated
    // admin may view a drafted article; every other caller (anonymous,
    // expired session, editor) gets the public view, which is limited to
    // published articles and returns 404 for soft-deleted ones.
    let admin = false;
    try {
      await requireRole(request, "admin");
      admin = true;
    } catch {
      admin = false;
    }

    const detail = await articleService.getArticle(parseArticleId(id), locale, { admin });
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { user } = await requireAdminMutation(request);
    const { id } = await context.params;
    const parsedId = parseArticleId(id);
    const body = await readJsonBody(request);
    const patch = parseUpdateBody(body);
    await articleService.updateArticle(parsedId, patch, { actorId: user.id });
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const detail = await articleService.getArticle(parsedId, locale, { admin: true });
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminMutation(request);
    const { id } = await context.params;
    await articleService.deleteArticle(parseArticleId(id));
    return noContent();
  } catch (error) {
    return failure(error);
  }
}