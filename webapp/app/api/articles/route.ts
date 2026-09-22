import type { NextRequest } from "next/server";
import { requireAdminMutation, requireRole } from "@/lib/server/auth/auth-guards";
import { articleService } from "@/lib/server/articles/article-service";
import {
  parseBooleanParam,
  parseCreateBody,
  parseCursor,
  parseIdParam,
  parseLimit,
  parseLocale,
  parsePage,
  parseStatus,
  readJsonBody,
} from "@/lib/server/articles/article-parsers";
import {
  MAX_ADMIN_LIMIT,
  MAX_PUBLIC_LIMIT,
  type ListQueryParams,
} from "@/lib/server/articles/article-types";
import { failure, ok } from "@/lib/server/articles/http";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const locale = parseLocale(params.get("locale"));
    const page = parsePage(params.get("page"));
    const status = parseStatus(params.get("status"));
    const mode: ListQueryParams["mode"] =
      page !== undefined || status !== undefined ? "admin" : "public";

    // Admin-mode listing (status/page filters, draft access, offsets) is
    // restricted to authenticated admins — a plain ?status=draft&page=1 no
    // longer escalates an anonymous request. Public feeds run untouched.
    if (mode === "admin") await requireRole(request, "admin");

    const limit = parseLimit(
      params.get("limit"),
      mode === "admin" ? MAX_ADMIN_LIMIT : MAX_PUBLIC_LIMIT,
    );
    const search = params.get("search")?.trim() || undefined;
    const categorySlug = params.get("category")?.trim() || undefined;
    const tagSlug = params.get("tag")?.trim() || undefined;
    const authorId = parseIdParam(params.get("author"), "author");
    const featured = parseBooleanParam(params.get("featured"), "featured");
    const breaking = parseBooleanParam(params.get("breaking"), "breaking");
    const cursor = mode === "public" ? parseCursor(params.get("cursor")) : undefined;

    const result = await articleService.listArticles({
      locale,
      mode,
      limit,
      page,
      status,
      search,
      categorySlug,
      tagSlug,
      authorId,
      featured,
      breaking,
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
    const id = await articleService.createArticle(input, { actorId: user.id });
    const detail = await articleService.getArticle(id, locale, { admin: true });
    return ok({ data: detail }, {
      status: 201,
      headers: { Location: `/api/articles/${id}` },
    });
  } catch (error) {
    return failure(error);
  }
}