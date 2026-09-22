import type { Locale, VideoStatus } from "../db/entities/enums";
import type {
  VideoDetailDto,
  VideoListItemDto,
} from "./video-types";
import type { VideoDetailRow, VideoListRow } from "./video-repository";

type ListRowLike = Pick<
  VideoListRow,
  | "id"
  | "slug"
  | "categoryId"
  | "status"
  | "featured"
  | "publishedAt"
  | "createdAt"
  | "updatedAt"
  | "durationSeconds"
  | "viewsCount"
  | "categorySlug"
  | "categoryNameBn"
  | "categoryNameEn"
  | "categoryColor"
  | "posterUrl"
  | "posterAlt"
  | "posterWidth"
  | "posterHeight"
  | "title"
  | "summary"
>;

function iso(value: Date | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toBool(value: unknown): boolean {
  return value === true || value === "true";
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function categoryName(locale: Locale, row: { categoryNameBn: string; categoryNameEn: string }): string {
  return locale === "bn" ? row.categoryNameBn : row.categoryNameEn;
}

/** Pick the requested locale, falling back to the other when it is empty. */
function pickLocalized(bn: string, en: string, locale: Locale): string {
  if (locale === "bn") return bn || en;
  return en || bn;
}

function poster(row: {
  posterUrl: string | null;
  posterAlt: string | null;
  posterWidth: number | null;
  posterHeight: number | null;
}): VideoListItemDto["poster"] {
  if (row.posterUrl === null) return null;
  const width = row.posterWidth === null ? null : Number(row.posterWidth);
  const height = row.posterHeight === null ? null : Number(row.posterHeight);
  return {
    url: row.posterUrl,
    alt: stringOrNull(row.posterAlt),
    width,
    height,
  };
}

/** Maps a list row to its public/admin DTO. */
export function toListItem(
  row: ListRowLike,
  locale: Locale,
  options: { admin?: boolean } = {},
): VideoListItemDto {
  const item: VideoListItemDto = {
    id: row.id,
    slug: row.slug,
    category: {
      slug: row.categorySlug,
      name: categoryName(locale, row),
      color: row.categoryColor,
    },
    title: row.title,
    summary: row.summary,
    poster: poster(row),
    durationSeconds: Number(row.durationSeconds),
    viewsCount: Number(row.viewsCount),
    featured: toBool(row.featured),
    publishedAt: iso(row.publishedAt),
  };
  if (options.admin) {
    item.status = row.status as VideoStatus;
    item.createdAt = iso(row.createdAt) ?? undefined;
    item.updatedAt = iso(row.updatedAt) ?? undefined;
  }
  return item;
}

/** Maps a detail fetch (video row + category + poster media) to its DTO. */
export function toDetail(
  raw: VideoDetailRow,
  locale: Locale,
): VideoDetailDto {
  const base = toListItem(raw, locale, { admin: true });
  const detail: VideoDetailDto = {
    ...base,
    videoUrl: raw.videoUrl,
    title: pickLocalized(raw.titleBn, raw.titleEn, locale),
    summary: pickLocalized(raw.summaryBn, raw.summaryEn, locale),
    status: raw.status as VideoStatus,
    createdAt: iso(raw.createdAt) ?? "",
    updatedAt: iso(raw.updatedAt) ?? "",
    author:
      raw.authorId !== null && raw.authorName !== null
        ? { id: raw.authorId, name: raw.authorName }
        : null,
    localized: {
      bn: { title: raw.titleBn, summary: raw.summaryBn },
      en: { title: raw.titleEn, summary: raw.summaryEn },
    },
  };
  return detail;
}