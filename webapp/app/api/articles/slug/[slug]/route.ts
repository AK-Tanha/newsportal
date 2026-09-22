import type { NextRequest } from "next/server";
import { articleService } from "@/lib/server/articles/article-service";
import { parseLocale, parseSlugParam } from "@/lib/server/articles/article-parsers";
import { failure, ok } from "@/lib/server/articles/http";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
    const detail = await articleService.getArticleBySlug(parseSlugParam(slug), locale);
    return ok({ data: detail });
  } catch (error) {
    return failure(error);
  }
}