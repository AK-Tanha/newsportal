import type { ArticleStatus, Locale } from "../db/entities/enums";

export const LOCALES: Locale[] = ["bn", "en"];

export const MAX_PUBLIC_LIMIT = 100;
export const MAX_ADMIN_LIMIT = 100;
export const DEFAULT_LIMIT = 20;

export interface ArticleContentDto {
  title: string;
  summary: string;
  body: string;
  readTimeMinutes: number | null;
}

/** Shared list/detail article record returned by the API. */
export interface ArticleListItemDto {
  id: string;
  slug: string;
  category: { slug: string; name: string; color: string };
  title: string;
  summary: string;
  image: { url: string; alt: string | null } | null;
  author: { id: string; name: string } | null;
  readTimeMinutes: number | null;
  publishedAt: string | null;
  featured: boolean;
  breaking: boolean;
  /** Present when the list was filtered by `search`. */
  searchRank?: number;
  /** Management fields, present in admin-mode listings. */
  status?: ArticleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleDetailDto extends ArticleListItemDto {
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  tags: { slug: string; name: string }[];
  content: Partial<Record<Locale, ArticleContentDto>>;
}

export interface LocalizedContentInput {
  title: string;
  summary: string;
  body: string;
  readTimeMinutes?: number | null;
}

/** Payload for POST /api/articles. */
export interface CreateArticleInput {
  slug: string;
  category: string;
  authorId?: string | null;
  featuredMediaId?: string | null;
  status?: ArticleStatus;
  isFeatured?: boolean;
  isBreaking?: boolean;
  publishedAt?: string | null;
  content: Record<Locale, LocalizedContentInput>;
  tags?: string[];
}

/** Payload for PATCH /api/articles/:id. */
export interface UpdateArticleInput {
  slug?: string;
  category?: string;
  authorId?: string | null;
  featuredMediaId?: string | null;
  status?: ArticleStatus;
  isFeatured?: boolean;
  isBreaking?: boolean;
  publishedAt?: string | null;
  content?: Partial<Record<Locale, LocalizedContentInput>>;
  tags?: string[];
}

/** Cursor for public keyset pagination (published_at DESC, id DESC). */
export interface ArticleCursor {
  publishedAt: string;
  id: string;
  /** Present when the feed is ordered by search relevance. */
  rank?: number;
}

export interface ListQueryParams {
  locale: Locale;
  mode: "public" | "admin";
  limit: number;
  cursor?: ArticleCursor;
  page?: number;
  status?: ArticleStatus;
  categorySlug?: string;
  tagSlug?: string;
  authorId?: string;
  featured?: boolean;
  breaking?: boolean;
  search?: string;
}

export interface ArticleListResult {
  data: ArticleListItemDto[];
  meta: {
    mode: "public" | "admin";
    locale: Locale;
    limit: number;
    total?: number;
    page?: number;
    hasNext?: boolean;
    nextCursor?: string;
  };
}

/**
 * Encodes a keyset cursor as a compact base64url token. Short keys keep the
 * token small enough for URLs and logging.
 */
export function encodeCursor(
  cursor: ArticleCursor,
): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

/** Decodes a keyset cursor token. Returns undefined for malformed input. */
export function decodeCursor(raw: string | undefined): ArticleCursor | undefined {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as Partial<ArticleCursor>;
    if (
      typeof value.publishedAt !== "string" ||
      !Number.isFinite(Date.parse(value.publishedAt)) ||
      typeof value.id !== "string" ||
      !/^\d+$/.test(value.id)
    ) {
      return undefined;
    }
    const result: ArticleCursor = {
      publishedAt: value.publishedAt,
      id: value.id,
    };
    if (typeof value.rank === "number" && Number.isFinite(value.rank)) {
      result.rank = value.rank;
    }
    return result;
  } catch {
    return undefined;
  }
}