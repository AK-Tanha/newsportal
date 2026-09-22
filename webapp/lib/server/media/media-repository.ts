import type { EntityManager, SelectQueryBuilder } from "typeorm";
import { Media } from "../db/entities/media";
import type { ListQueryParams, MediaUsage } from "./media-types";

export interface MediaRow {
  id: string;
  filename: string;
  url: string;
  storageKey: string | null;
  type: string;
  mimeType: string | null;
  sizeBytes: string | null;
  width: number | null;
  height: number | null;
  alt: string | null;
  uploaderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaListResult {
  rows: MediaRow[];
  count: number;
}

const LIST_SELECTS = (qb: SelectQueryBuilder<Media>): void => {
  qb.select("m.id", "id")
    .addSelect("m.filename", "filename")
    .addSelect("m.url", "url")
    .addSelect("m.storage_key", "storageKey")
    .addSelect("m.type", "type")
    .addSelect("m.mime_type", "mimeType")
    .addSelect("m.size_bytes", "sizeBytes")
    .addSelect("m.width", "width")
    .addSelect("m.height", "height")
    .addSelect("m.alt", "alt")
    .addSelect("m.uploader_id", "uploaderId")
    .addSelect("m.created_at", "createdAt")
    .addSelect("m.updated_at", "updatedAt");
};

/**
 * Builds the shared media query with the optional search and type filters.
 * Search covers filename, alt and url via a single ILIKE scan (the same
 * substring strategy used by the ads API; wildcard characters are not
 * escaped, matching the established archive behavior — documented). Media is
 * an admin library, so the type filter is a plain column predicate.
 */
function baseMediaQuery(
  em: EntityManager,
  params: ListQueryParams,
): SelectQueryBuilder<Media> {
  const qb = em.createQueryBuilder().from(Media, "m");

  if (params.search) {
    const pattern = `%${params.search}%`;
    qb.andWhere(
      "(m.filename ILIKE :search OR m.alt ILIKE :search OR m.url ILIKE :search)",
      { search: pattern },
    );
  }
  if (params.type) {
    qb.andWhere("m.type = :type", { type: params.type });
  }

  return qb;
}

/**
 * Lists media with OFFSET/LIMIT pagination and a total count, ordered
 * deterministically newest-first (matches the ix_media_type_created index).
 */
export async function findMedia(
  em: EntityManager,
  params: ListQueryParams,
): Promise<MediaListResult> {
  const qb = baseMediaQuery(em, params);
  LIST_SELECTS(qb);
  qb.orderBy("m.created_at", "DESC").addOrderBy("m.id", "DESC");
  qb.offset((params.page - 1) * params.limit).limit(params.limit);
  const rows = await qb.getRawMany<MediaRow>();
  const count = await countMedia(em, params);
  return { rows, count };
}

export async function countMedia(
  em: EntityManager,
  params: ListQueryParams,
): Promise<number> {
  const qb = baseMediaQuery(em, params).select("m.id");
  return qb.getCount();
}

/** Fetches one media row by id (projection only). */
export async function findMediaById(
  em: EntityManager,
  id: string,
): Promise<MediaRow | undefined> {
  const qb = em.createQueryBuilder().from(Media, "m");
  LIST_SELECTS(qb);
  qb.where("m.id = :id", { id });
  return (await qb.getRawOne<MediaRow>()) ?? undefined;
}

/**
 * Counts every live record that references this media row across the four
 * content tables, in a single aggregate query (no N+1). Only runs on the
 * detail endpoint, never on the list. A parameterized raw query is used
 * because the correlated subselects need no FROM alias.
 */
export async function countMediaUsage(
  em: EntityManager,
  id: string,
): Promise<MediaUsage> {
  const rows = await em.query<Array<{ articles: number; videos: number; liveStreams: number; advertisements: number }>>(
    `SELECT
       (SELECT count(*)::int FROM articles WHERE featured_media_id = $1) AS articles,
       (SELECT count(*)::int FROM videos WHERE poster_media_id = $1) AS videos,
       (SELECT count(*)::int FROM live_streams WHERE poster_media_id = $1) AS "liveStreams",
       (SELECT count(*)::int FROM advertisements WHERE image_media_id = $1) AS advertisements`,
    [id],
  );
  const row = rows[0];
  return {
    articles: row?.articles ?? 0,
    videos: row?.videos ?? 0,
    liveStreams: row?.liveStreams ?? 0,
    advertisements: row?.advertisements ?? 0,
  };
}

/**
 * Hard-deletes a media row. Safe because every referencing foreign key uses
 * ON DELETE SET NULL (articles.featured_media_id, videos.poster_media_id,
 * live_streams.poster_media_id, advertisements.image_media_id): the row is
 * removed and referencing columns become NULL. No content is ever deleted.
 * Returns false when the id does not exist.
 */
export async function deleteMedia(em: EntityManager, id: string): Promise<boolean> {
  const result = await em
    .createQueryBuilder()
    .delete()
    .from(Media)
    .where("id = :id", { id })
    .execute();
  return (result.affected ?? 0) > 0;
}