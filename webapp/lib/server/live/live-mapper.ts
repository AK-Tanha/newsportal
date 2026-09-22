import type { LiveStatus, Locale } from "../db/entities/enums";
import type { LiveDetailDto, LiveListItemDto } from "./live-types";
import type { LiveDetailRow, LiveListRow } from "./live-repository";

type ListRowLike = Pick<
  LiveListRow,
  | "id"
  | "slug"
  | "categoryId"
  | "status"
  | "isActive"
  | "startedAt"
  | "viewerCount"
  | "createdAt"
  | "updatedAt"
  | "categorySlug"
  | "categoryNameBn"
  | "categoryNameEn"
  | "categoryColor"
  | "posterUrl"
  | "posterAlt"
  | "posterWidth"
  | "posterHeight"
  | "title"
  | "description"
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
}): LiveListItemDto["poster"] {
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
): LiveListItemDto {
  const item: LiveListItemDto = {
    id: row.id,
    slug: row.slug,
    category: {
      slug: row.categorySlug,
      name: categoryName(locale, row),
      color: row.categoryColor,
    },
    title: row.title,
    description: row.description,
    poster: poster(row),
    status: row.status as LiveStatus,
    startedAt: iso(row.startedAt),
    viewerCount: Number(row.viewerCount),
    streamUrl: null,
  };
  if (options.admin) {
    item.active = toBool(row.isActive);
    item.createdAt = iso(row.createdAt) ?? undefined;
    item.updatedAt = iso(row.updatedAt) ?? undefined;
  }
  return item;
}

/** Maps a detail fetch (stream row + category + poster media) to its DTO. */
export function toDetail(
  raw: LiveDetailRow,
  locale: Locale,
): LiveDetailDto {
  const base = toListItem(raw, locale, { admin: true });
  return {
    ...base,
    streamUrl: raw.streamUrl,
    title: pickLocalized(raw.titleBn, raw.titleEn, locale),
    description: pickLocalized(raw.descriptionBn, raw.descriptionEn, locale),
    active: toBool(raw.isActive),
    createdAt: iso(raw.createdAt) ?? "",
    updatedAt: iso(raw.updatedAt) ?? "",
    localized: {
      bn: { title: raw.titleBn, description: raw.descriptionBn },
      en: { title: raw.titleEn, description: raw.descriptionEn },
    },
  };
}