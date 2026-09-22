import type { Locale, VideoStatus } from "../db/entities/enums";

export const LOCALES: Locale[] = ["bn", "en"];

export const MAX_PUBLIC_LIMIT = 100;
export const MAX_ADMIN_LIMIT = 100;
export const DEFAULT_LIMIT = 20;

export interface VideoPosterDto {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface VideoAuthorDto {
  id: string;
  name: string;
}

/** Shared list/detail video record returned by the API. */
export interface VideoListItemDto {
  id: string;
  slug: string;
  category: { slug: string; name: string; color: string };
  title: string;
  summary: string;
  poster: VideoPosterDto | null;
  durationSeconds: number;
  viewsCount: number;
  featured: boolean;
  publishedAt: string | null;
  /** Management fields, present in admin-mode listings. */
  status?: VideoStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoDetailDto extends VideoListItemDto {
  videoUrl: string;
  status: VideoStatus;
  createdAt: string;
  updatedAt: string;
  author: VideoAuthorDto | null;
  localized: Record<Locale, { title: string; summary: string }>;
}

/** Payload for POST /api/videos. */
export interface CreateVideoInput {
  slug: string;
  category: string;
  authorId?: string | null;
  posterMediaId?: string | null;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  videoUrl: string;
  durationSeconds?: number;
  viewsCount?: number;
  featured?: boolean;
  status?: VideoStatus;
  publishedAt?: string | null;
}

/** Payload for PATCH /api/videos/:id. */
export interface UpdateVideoInput {
  slug?: string;
  category?: string;
  authorId?: string | null;
  posterMediaId?: string | null;
  title?: Partial<Record<Locale, string>>;
  summary?: Partial<Record<Locale, string>>;
  videoUrl?: string;
  durationSeconds?: number;
  viewsCount?: number;
  featured?: boolean;
  status?: VideoStatus;
  publishedAt?: string | null;
}

/** Cursor for public keyset pagination (published_at DESC, id DESC). */
export interface VideoCursor {
  publishedAt: string;
  id: string;
}

export interface ListQueryParams {
  locale: Locale;
  mode: "public" | "admin";
  limit: number;
  cursor?: VideoCursor;
  page?: number;
  status?: VideoStatus;
  categorySlug?: string;
  featured?: boolean;
  search?: string;
}

export interface VideoListResult {
  data: VideoListItemDto[];
  meta: {
    mode: "public" | "admin";
    locale: Locale;
    limit: number;
    total?: number;
    page?: number;
    totalPages?: number;
    hasNext?: boolean;
    nextCursor?: string;
  };
}

/**
 * Encodes a keyset cursor as a compact base64url token. Short keys keep the
 * token small enough for URLs and logging.
 */
export function encodeCursor(cursor: VideoCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

/** Decodes a keyset cursor token. Returns undefined for malformed input. */
export function decodeCursor(raw: string | undefined): VideoCursor | undefined {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as Partial<VideoCursor>;
    if (
      typeof value.publishedAt !== "string" ||
      !Number.isFinite(Date.parse(value.publishedAt)) ||
      typeof value.id !== "string" ||
      !/^\d+$/.test(value.id)
    ) {
      return undefined;
    }
    return { publishedAt: value.publishedAt, id: value.id };
  } catch {
    return undefined;
  }
}