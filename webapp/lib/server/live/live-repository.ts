import type { EntityManager, SelectQueryBuilder } from "typeorm";
import { Category } from "../db/entities/category";
import { LiveStream } from "../db/entities/live-stream";
import { Media } from "../db/entities/media";
import type { Locale } from "../db/entities/enums";
import type { ListQueryParams } from "./live-types";

export interface LiveListRow {
  id: string;
  slug: string;
  categoryId: number;
  status: string;
  isActive: boolean;
  startedAt: Date | null;
  viewerCount: number;
  createdAt: Date;
  updatedAt: Date;
  categorySlug: string;
  categoryNameBn: string;
  categoryNameEn: string;
  categoryColor: string;
  posterUrl: string | null;
  posterAlt: string | null;
  posterWidth: number | null;
  posterHeight: number | null;
  title: string;
  description: string;
}

export interface LiveDetailRow extends LiveListRow {
  streamUrl: string | null;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
}

export interface LiveListResult {
  rows: LiveListRow[];
  count?: number;
}

const LIST_SELECTS = (
  qb: SelectQueryBuilder<LiveStream>,
  locale: Locale,
): void => {
  qb.select("s.id", "id")
    .addSelect("s.slug", "slug")
    .addSelect("s.category_id", "categoryId")
    .addSelect("s.status", "status")
    .addSelect("s.is_active", "isActive")
    .addSelect("s.started_at", "startedAt")
    .addSelect("s.viewer_count", "viewerCount")
    .addSelect("s.created_at", "createdAt")
    .addSelect("s.updated_at", "updatedAt")
    .addSelect(locale === "bn" ? "s.title_bn" : "s.title_en", "title")
    .addSelect(locale === "bn" ? "s.description_bn" : "s.description_en", "description")
    .addSelect("c.slug", "categorySlug")
    .addSelect("c.name_bn", "categoryNameBn")
    .addSelect("c.name_en", "categoryNameEn")
    .addSelect("c.color", "categoryColor")
    .addSelect("m.url", "posterUrl")
    .addSelect("m.alt", "posterAlt")
    .addSelect("m.width", "posterWidth")
    .addSelect("m.height", "posterHeight");
};

/**
 * Builds the shared live-stream query: display joins plus every filter.
 * Ordering and pagination are applied by the caller so the same builder
 * powers public, admin and count queries.
 */
function baseLiveQuery(
  em: EntityManager,
  params: ListQueryParams,
): SelectQueryBuilder<LiveStream> {
  const qb = em
    .createQueryBuilder()
    .from(LiveStream, "s")
    .leftJoin("categories", "c", "c.id = s.category_id")
    .leftJoin("media", "m", "m.id = s.poster_media_id");

  if (params.mode === "admin") {
    if (params.status) qb.andWhere("s.status = :status", { status: params.status });
    if (params.active !== undefined) {
      qb.andWhere("s.is_active = :active", { active: params.active });
    }
  }

  if (params.categorySlug) {
    qb.andWhere("c.slug = :categorySlug", { categorySlug: params.categorySlug });
  }

  return qb;
}

/**
 * Lists live streams. The dataset is tiny, so the public mode returns the
 * full ordered set (active first) capped at the requested limit; admin mode
 * uses conventional offset pagination with a total count.
 */
export async function findLiveStreams(
  em: EntityManager,
  params: ListQueryParams,
): Promise<LiveListResult> {
  const qb = baseLiveQuery(em, params);
  LIST_SELECTS(qb, params.locale);

  if (params.mode === "public") {
    qb.orderBy("s.is_active", "DESC")
      .addOrderBy("s.id", "DESC")
      .limit(params.limit);
    const rows = await qb.getRawMany<LiveListRow>();
    return { rows };
  }

  qb.orderBy("s.created_at", "DESC")
    .addOrderBy("s.id", "DESC")
    .offset(((params.page ?? 1) - 1) * params.limit)
    .limit(params.limit);
  const rows = await qb.getRawMany<LiveListRow>();
  const count = await countLiveStreams(em, params);
  return { rows, count };
}

export async function countLiveStreams(
  em: EntityManager,
  params: ListQueryParams,
): Promise<number> {
  const qb = baseLiveQuery(em, params).select("s.id");
  return qb.getCount();
}

const DETAIL_SELECTS = (qb: SelectQueryBuilder<LiveStream>): void => {
  qb.select("s.id", "id")
    .addSelect("s.slug", "slug")
    .addSelect("s.category_id", "categoryId")
    .addSelect("s.status", "status")
    .addSelect("s.is_active", "isActive")
    .addSelect("s.started_at", "startedAt")
    .addSelect("s.viewer_count", "viewerCount")
    .addSelect("s.created_at", "createdAt")
    .addSelect("s.updated_at", "updatedAt")
    .addSelect("s.stream_url", "streamUrl")
    .addSelect("s.title_bn", "titleBn")
    .addSelect("s.title_en", "titleEn")
    .addSelect("s.description_bn", "descriptionBn")
    .addSelect("s.description_en", "descriptionEn")
    .addSelect("c.slug", "categorySlug")
    .addSelect("c.name_bn", "categoryNameBn")
    .addSelect("c.name_en", "categoryNameEn")
    .addSelect("c.color", "categoryColor")
    .addSelect("m.url", "posterUrl")
    .addSelect("m.alt", "posterAlt")
    .addSelect("m.width", "posterWidth")
    .addSelect("m.height", "posterHeight");
};

/** Fetches one live stream by id, regardless of status (management view). */
export async function findLiveDetail(
  em: EntityManager,
  id: string,
): Promise<LiveDetailRow | undefined> {
  const qb = em.createQueryBuilder();
  DETAIL_SELECTS(qb);
  qb.from(LiveStream, "s")
    .leftJoin("categories", "c", "c.id = s.category_id")
    .leftJoin("media", "m", "m.id = s.poster_media_id")
    .where("s.id = :id", { id });
  return (await qb.getRawOne<LiveDetailRow>()) ?? undefined;
}

/**
 * Fetches the currently active stream. Exactly one row can have is_active set
 * because of the partial unique index uq_live_streams_single_active; this
 * query is served straight off that index. Returns undefined when no stream
 * is live (NO STREAM).
 */
export async function findActiveStream(
  em: EntityManager,
): Promise<LiveDetailRow | undefined> {
  const qb = em.createQueryBuilder();
  DETAIL_SELECTS(qb);
  qb.from(LiveStream, "s")
    .leftJoin("categories", "c", "c.id = s.category_id")
    .leftJoin("media", "m", "m.id = s.poster_media_id")
    .where("s.is_active = TRUE")
    .limit(1);
  return (await qb.getRawOne<LiveDetailRow>()) ?? undefined;
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

/** True when a live stream already uses the slug (mirrors the DB unique index). */
export async function slugExists(
  em: EntityManager,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const qb = em
    .getRepository(LiveStream)
    .createQueryBuilder("s")
    .select("s.id", "id")
    .where("s.slug = :slug", { slug });
  if (excludeId) qb.andWhere("s.id <> :excludeId", { excludeId });
  return (await qb.getRawOne<{ id: string }>()) !== undefined;
}

/** Loads one live-stream row for update flows. */
export async function findLiveById(
  em: EntityManager,
  id: string,
): Promise<LiveStream | undefined> {
  return (await em.findOne(LiveStream, { where: { id } })) ?? undefined;
}

/**
 * Hard-deletes a live stream. The live_streams table has no soft-delete
 * column, so the schema is left untouched and the row is removed. Returns
 * false when the id does not exist.
 */
export async function deleteLiveStream(em: EntityManager, id: string): Promise<boolean> {
  const result = await em
    .createQueryBuilder()
    .delete()
    .from(LiveStream)
    .where("id = :id", { id })
    .execute();
  return (result.affected ?? 0) > 0;
}