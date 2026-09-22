import type { EntityManager, SelectQueryBuilder } from "typeorm";
import { IsNull } from "typeorm";
import { Category } from "../db/entities/category";
import { Media } from "../db/entities/media";
import { User } from "../db/entities/user";
import { Video } from "../db/entities/video";
import type { Locale } from "../db/entities/enums";
import type { ListQueryParams } from "./video-types";

export interface VideoListRow {
  id: string;
  slug: string;
  categoryId: number;
  status: string;
  featured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  durationSeconds: number;
  viewsCount: number;
  categorySlug: string;
  categoryNameBn: string;
  categoryNameEn: string;
  categoryColor: string;
  posterUrl: string | null;
  posterAlt: string | null;
  posterWidth: number | null;
  posterHeight: number | null;
  title: string;
  summary: string;
}

export interface VideoDetailRow extends VideoListRow {
  videoUrl: string;
  deletedAt: Date | null;
  titleBn: string;
  summaryBn: string;
  titleEn: string;
  summaryEn: string;
  authorId: string | null;
  authorName: string | null;
}

export interface VideoListResult {
  rows: VideoListRow[];
  hasNext?: boolean;
  count?: number;
}

const LIST_SELECTS = (
  qb: SelectQueryBuilder<Video>,
  locale: Locale,
): void => {
  qb.select("v.id", "id")
    .addSelect("v.slug", "slug")
    .addSelect("v.category_id", "categoryId")
    .addSelect("v.status", "status")
    .addSelect("v.featured", "featured")
    .addSelect("v.published_at", "publishedAt")
    .addSelect("v.created_at", "createdAt")
    .addSelect("v.updated_at", "updatedAt")
    .addSelect("v.duration_seconds", "durationSeconds")
    .addSelect("v.views_count", "viewsCount")
    .addSelect(locale === "bn" ? "v.title_bn" : "v.title_en", "title")
    .addSelect(locale === "bn" ? "v.summary_bn" : "v.summary_en", "summary")
    .addSelect("c.slug", "categorySlug")
    .addSelect("c.name_bn", "categoryNameBn")
    .addSelect("c.name_en", "categoryNameEn")
    .addSelect("c.color", "categoryColor")
    .addSelect("m.url", "posterUrl")
    .addSelect("m.alt", "posterAlt")
    .addSelect("m.width", "posterWidth")
    .addSelect("m.height", "posterHeight");
};

/** Escapes LIKE wildcards so user input is always a plain substring match. */
function likePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

/**
 * Builds the shared video query: from/to-one joins for display, the active
 * record guard, and every list filter. Ordering and pagination are applied by
 * the caller so the same builder powers public, admin and count queries.
 */
function baseVideoQuery(
  em: EntityManager,
  params: ListQueryParams,
): SelectQueryBuilder<Video> {
  const qb = em
    .createQueryBuilder()
    .from(Video, "v")
    .leftJoin("categories", "c", "c.id = v.category_id")
    .leftJoin("media", "m", "m.id = v.poster_media_id")
    .andWhere("v.deleted_at IS NULL");

  if (params.mode === "public") {
    qb.andWhere("v.status = 'published'");
  } else if (params.status) {
    qb.andWhere("v.status = :status", { status: params.status });
  }

  if (params.categorySlug) {
    qb.andWhere("c.slug = :categorySlug", { categorySlug: params.categorySlug });
  }
  if (params.featured !== undefined) {
    qb.andWhere("v.featured = :featured", { featured: params.featured });
  }
  if (params.search) {
    qb.andWhere(
      "(v.title_bn ILIKE :search OR v.title_en ILIKE :search OR v.summary_bn ILIKE :search OR v.summary_en ILIKE :search)",
      { search: `%${likePattern(params.search)}%` },
    );
  }

  return qb;
}

/**
 * Lists videos. Public feeds use keyset pagination on
 * (published_at DESC, id DESC); admin feeds use offsets on
 * (created_at DESC, id DESC).
 */
export async function findVideos(
  em: EntityManager,
  params: ListQueryParams,
): Promise<VideoListResult> {
  if (params.mode === "public") {
    const qb = baseVideoQuery(em, params);
    LIST_SELECTS(qb, params.locale);

    if (params.cursor) {
      qb.andWhere(
        "(v.published_at < :pub OR (v.published_at = :pub AND v.id < :id))",
        { pub: params.cursor.publishedAt, id: params.cursor.id },
      );
    }

    qb.orderBy("v.published_at", "DESC")
      .addOrderBy("v.id", "DESC")
      .limit(params.limit + 1);

    const rows = await qb.getRawMany<VideoListRow>();
    const hasNext = rows.length > params.limit;
    return { rows: hasNext ? rows.slice(0, params.limit) : rows, hasNext };
  }

  const qb = baseVideoQuery(em, params);
  LIST_SELECTS(qb, params.locale);
  qb.orderBy("v.created_at", "DESC")
    .addOrderBy("v.id", "DESC")
    .offset(((params.page ?? 1) - 1) * params.limit)
    .limit(params.limit);
  const rows = await qb.getRawMany<VideoListRow>();
  const count = await countVideos(em, params);
  return { rows, count };
}

export async function countVideos(
  em: EntityManager,
  params: ListQueryParams,
): Promise<number> {
  const qb = baseVideoQuery(em, params).select("v.id");
  return qb.getCount();
}

export interface DetailOptions {
  publicOnly?: boolean;
}

export interface VideoIdentifier {
  id?: string;
  slug?: string;
}

/**
 * Fetches one video row (by id or slug) with its category and poster media.
 * Soft-deleted videos and (optionally) unpublished videos are treated as not
 * found. Unlike the articles table there is no separate content table, so the
 * detail row carries both locales as columns.
 */
export async function findVideoDetail(
  em: EntityManager,
  identifier: VideoIdentifier,
  options: DetailOptions = {},
): Promise<VideoDetailRow | undefined> {
  const qb = em
    .createQueryBuilder()
    .select("v.id", "id")
    .addSelect("v.slug", "slug")
    .addSelect("v.category_id", "categoryId")
    .addSelect("v.status", "status")
    .addSelect("v.featured", "featured")
    .addSelect("v.published_at", "publishedAt")
    .addSelect("v.created_at", "createdAt")
    .addSelect("v.updated_at", "updatedAt")
    .addSelect("v.deleted_at", "deletedAt")
    .addSelect("v.duration_seconds", "durationSeconds")
    .addSelect("v.views_count", "viewsCount")
    .addSelect("v.video_url", "videoUrl")
    .addSelect("v.title_bn", "titleBn")
    .addSelect("v.summary_bn", "summaryBn")
    .addSelect("v.title_en", "titleEn")
    .addSelect("v.summary_en", "summaryEn")
    .addSelect("c.slug", "categorySlug")
    .addSelect("c.name_bn", "categoryNameBn")
    .addSelect("c.name_en", "categoryNameEn")
    .addSelect("c.color", "categoryColor")
    .addSelect("m.url", "posterUrl")
    .addSelect("m.alt", "posterAlt")
    .addSelect("m.width", "posterWidth")
    .addSelect("m.height", "posterHeight")
    .addSelect("u.id", "authorId")
    .addSelect("u.full_name", "authorName")
    .from(Video, "v")
    .leftJoin("categories", "c", "c.id = v.category_id")
    .leftJoin("media", "m", "m.id = v.poster_media_id")
    .leftJoin("users", "u", "u.id = v.author_id")
    .where("v.deleted_at IS NULL");

  if (identifier.id !== undefined) {
    qb.andWhere("v.id = :id", { id: identifier.id });
  }
  if (identifier.slug !== undefined) {
    qb.andWhere("v.slug = :slug", { slug: identifier.slug });
  }

  if (options.publicOnly) {
    qb.andWhere("v.status = 'published'");
  }

  return (await qb.getRawOne<VideoDetailRow>()) ?? undefined;
}

/** True when a category with the given slug exists. */
export async function findCategoryIdBySlug(
  em: EntityManager,
  slug: string,
): Promise<number | undefined> {
  const row = await em
    .getRepository(Category)
    .createQueryBuilder("c")
    .select("c.id", "id")
    .where("c.slug = :slug", { slug })
    .getRawOne<{ id: number }>();
  return row?.id;
}

export async function mediaExists(em: EntityManager, id: string): Promise<boolean> {
  return (await em.findOne(Media, { where: { id } })) !== null;
}

export async function userExists(em: EntityManager, id: string): Promise<boolean> {
  const row = await em
    .getRepository(User)
    .createQueryBuilder("u")
    .select("u.id", "id")
    .where("u.id = :id", { id })
    .getRawOne<{ id: string }>();
  return row !== undefined;
}

/** True when a video already uses the slug (mirrors the DB unique index). */
export async function slugExists(
  em: EntityManager,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const qb = em
    .getRepository(Video)
    .createQueryBuilder("v")
    .select("v.id", "id")
    .where("v.slug = :slug", { slug });
  if (excludeId) qb.andWhere("v.id <> :excludeId", { excludeId });
  return (await qb.getRawOne<{ id: string }>()) !== undefined;
}

/** Loads one non-deleted video row for update flows. */
export async function findVideoById(
  em: EntityManager,
  id: string,
): Promise<Video | undefined> {
  return (await em.findOne(Video, { where: { id, deletedAt: IsNull() } })) ?? undefined;
}

/** Soft-deletes a video by stamping deleted_at. Returns false if absent. */
export async function softDeleteVideo(em: EntityManager, id: string): Promise<boolean> {
  const result = await em
    .createQueryBuilder()
    .update(Video)
    .set({ deletedAt: new Date() })
    .where("id = :id AND deleted_at IS NULL", { id })
    .execute();
  return (result.affected ?? 0) > 0;
}