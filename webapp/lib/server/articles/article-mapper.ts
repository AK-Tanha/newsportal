import type { ArticleStatus, Locale } from "../db/entities/enums";
import {
  type ArticleContentDto,
  type ArticleDetailDto,
  type ArticleListItemDto,
} from "./article-types";
import type {
  ArticleContentRow,
  ArticleDetailRaw,
  ArticleListRow,
} from "./article-repository";

/** Shared subset of fields both list and detail raw rows expose. */
type ListRowLike = Pick<
  ArticleListRow,
  | "id"
  | "slug"
  | "categoryId"
  | "status"
  | "isFeatured"
  | "isBreaking"
  | "publishedAt"
  | "createdAt"
  | "updatedAt"
  | "categorySlug"
  | "categoryNameBn"
  | "categoryNameEn"
  | "categoryColor"
  | "mediaUrl"
  | "mediaAlt"
  | "authorId"
  | "authorName"
  | "rank"
> & { title?: string | null; summary?: string | null; readTimeMinutes?: number | null };

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

/** Maps a list row to its public/admin DTO. */
export function toListItem(
  row: ListRowLike,
  locale: Locale,
  options: { admin?: boolean } = {},
): ArticleListItemDto {
  const item: ArticleListItemDto = {
    id: row.id,
    slug: row.slug,
    category: {
      slug: row.categorySlug,
      name: categoryName(locale, row),
      color: row.categoryColor,
    },
    title: row.title ?? "",
    summary: row.summary ?? "",
    image:
      row.mediaUrl !== null
        ? { url: row.mediaUrl, alt: stringOrNull(row.mediaAlt) }
        : null,
    author:
      row.authorId !== null && row.authorName !== null
        ? { id: row.authorId, name: row.authorName }
        : null,
    readTimeMinutes: row.readTimeMinutes ?? null,
    publishedAt: iso(row.publishedAt),
    featured: toBool(row.isFeatured),
    breaking: toBool(row.isBreaking),
  };
  if (row.rank !== undefined && row.rank !== null) {
    item.searchRank = Number(row.rank);
  }
  if (options.admin) {
    item.status = row.status as ArticleStatus;
    item.createdAt = iso(row.createdAt) ?? undefined;
    item.updatedAt = iso(row.updatedAt) ?? undefined;
  }
  return item;
}

function contentRowToInput(row: ArticleContentRow): ArticleContentDto {
  return {
    title: row.title,
    summary: row.summary,
    body: row.body,
    readTimeMinutes: row.readTimeMinutes ?? null,
  };
}

/** Maps a detail fetch (article + contents + tags) to its DTO. */
export function toDetail(
  raw: ArticleDetailRaw,
  locale: Locale,
): ArticleDetailDto {
  const { article, contents, tags } = raw;
  const base = toListItem(article, locale, { admin: true });

  const content: Partial<Record<Locale, ArticleContentDto>> = {};
  for (const row of contents) {
    content[row.locale] = contentRowToInput(row);
  }
  const locales: Locale[] = ["bn", "en"];
  for (const localeKey of locales) {
    if (!content[localeKey]) {
      content[localeKey] = {
        title: "",
        summary: "",
        body: "",
        readTimeMinutes: null,
      };
    }
  }

  const localized = content[locale];
  return {
    ...base,
    title: localized?.title || base.title,
    summary: localized?.summary || base.summary,
    readTimeMinutes: localized?.readTimeMinutes ?? base.readTimeMinutes,
    status: article.status as ArticleStatus,
    createdAt: iso(article.createdAt) ?? "",
    updatedAt: iso(article.updatedAt) ?? "",
    content: content as Record<Locale, ArticleContentDto>,
    tags: tags.map((tag) => ({ slug: tag.slug, name: tag.name })),
  };
}