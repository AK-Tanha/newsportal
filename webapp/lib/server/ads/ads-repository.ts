import type { EntityManager, SelectQueryBuilder } from "typeorm";
import { Advertisement } from "../db/entities/advertisement";
import { AdvertisementPlacement } from "../db/entities/advertisement-placement";
import { Media } from "../db/entities/media";
import type { AdPlacement } from "../db/entities/enums";
import type { ListQueryParams } from "./ads-types";

export interface AdRow {
  id: string;
  slug: string;
  type: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string | null;
  descriptionEn: string | null;
  targetUrl: string;
  alt: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
}

export interface AdListResult {
  rows: AdRow[];
  count?: number;
}

export interface AdPlacementRow {
  advertisementId: string;
  placement: AdPlacement;
}

const LIST_SELECTS = (qb: SelectQueryBuilder<Advertisement>): void => {
  qb.select("a.id", "id")
    .addSelect("a.slug", "slug")
    .addSelect("a.type", "type")
    .addSelect("a.title_bn", "titleBn")
    .addSelect("a.title_en", "titleEn")
    .addSelect("a.description_bn", "descriptionBn")
    .addSelect("a.description_en", "descriptionEn")
    .addSelect("a.target_url", "targetUrl")
    .addSelect("a.alt", "alt")
    .addSelect("a.is_active", "isActive")
    .addSelect("TO_CHAR(a.start_date, 'YYYY-MM-DD')", "startDate")
    .addSelect("TO_CHAR(a.end_date, 'YYYY-MM-DD')", "endDate")
    .addSelect("a.created_at", "createdAt")
    .addSelect("a.updated_at", "updatedAt")
    .addSelect("m.url", "imageUrl")
    .addSelect("m.alt", "imageAlt")
    .addSelect("m.width", "imageWidth")
    .addSelect("m.height", "imageHeight");
};

/**
 * Builds the shared advertisement query: the display media join plus every
 * filter. The public mode only returns ads that are currently eligible
 * (active hand-flag AND within the scheduled date window AND on the requested
 * placement). All date/active filtering happens in PostgreSQL, never in
 * JavaScript. Ordering and pagination are applied by the caller so the same
 * builder powers public, admin and count queries.
 */
function baseAdQuery(
  em: EntityManager,
  params: ListQueryParams,
): SelectQueryBuilder<Advertisement> {
  const qb = em
    .createQueryBuilder()
    .from(Advertisement, "a")
    .leftJoin("media", "m", "m.id = a.image_media_id");

  if (params.mode === "public") {
    qb.andWhere("a.is_active = TRUE")
      .andWhere("(a.start_date IS NULL OR a.start_date <= CURRENT_DATE)")
      .andWhere("(a.end_date IS NULL OR a.end_date >= CURRENT_DATE)");
  } else {
    if (params.type) qb.andWhere("a.type = :type", { type: params.type });
    if (params.active !== undefined) {
      qb.andWhere("a.is_active = :active", { active: params.active });
    }
    if (params.startDate) qb.andWhere("a.start_date >= :startDate", { startDate: params.startDate });
    if (params.endDate) qb.andWhere("a.end_date <= :endDate", { endDate: params.endDate });
    if (params.search) {
      const pattern = `%${params.search}%`;
      qb.andWhere(
        "(a.title_bn ILIKE :search OR a.title_en ILIKE :search OR " +
          "a.description_bn ILIKE :search OR a.description_en ILIKE :search OR " +
          "a.alt ILIKE :search)",
        { search: pattern },
      );
    }
  }

  if (params.placement) {
    qb.andWhere(
      "EXISTS (SELECT 1 FROM advertisement_placements p WHERE p.advertisement_id = a.id AND p.placement = :placement)",
      { placement: params.placement },
    );
  }

  return qb;
}

/**
 * Lists advertisements. Public mode returns all currently-eligible ads (or
 * those on a single placement) in deterministic id order; admin mode uses
 * conventional offset pagination with a total count.
 */
export async function findAds(
  em: EntityManager,
  params: ListQueryParams,
): Promise<AdListResult> {
  const qb = baseAdQuery(em, params);
  LIST_SELECTS(qb);

  if (params.mode === "public") {
    qb.orderBy("a.id", "ASC").limit(params.limit);
    const rows = await qb.getRawMany<AdRow>();
    return { rows };
  }

  qb.orderBy("a.created_at", "DESC").addOrderBy("a.id", "DESC");
  qb.offset(((params.page ?? 1) - 1) * params.limit).limit(params.limit);
  const rows = await qb.getRawMany<AdRow>();
  const count = await countAds(em, params);
  return { rows, count };
}

export async function countAds(
  em: EntityManager,
  params: ListQueryParams,
): Promise<number> {
  const qb = baseAdQuery(em, params).select("a.id");
  return qb.getCount();
}

const DETAIL_SELECTS = (qb: SelectQueryBuilder<Advertisement>): void => {
  LIST_SELECTS(qb);
  qb.addSelect("a.image_media_id", "imageMediaId");
};

/** Fetches one advertisement by id with its image media row. */
export async function findAdDetail(
  em: EntityManager,
  id: string,
): Promise<(AdRow & { imageMediaId: string | null }) | undefined> {
  const qb = em.createQueryBuilder();
  DETAIL_SELECTS(qb);
  qb.from(Advertisement, "a")
    .leftJoin("media", "m", "m.id = a.image_media_id")
    .where("a.id = :id", { id });
  return (await qb.getRawOne<AdRow & { imageMediaId: string | null }>()) ?? undefined;
}

/**
 * Loads the placement rows for a set of advertisements in a single query,
 * grouped by advertisement id. Avoids the N+1 placement fetch that a
 * per-row query would perform on every list/detail call.
 */
export async function findPlacementsForAds(
  em: EntityManager,
  ids: string[],
): Promise<Map<string, AdPlacement[]>> {
  const groups = new Map<string, AdPlacement[]>();
  if (ids.length === 0) return groups;
  for (const id of ids) groups.set(id, []);
  const rows = await em
    .createQueryBuilder()
    .select("p.advertisement_id", "advertisementId")
    .addSelect("p.placement", "placement")
    .from(AdvertisementPlacement, "p")
    .where("p.advertisement_id IN (:...ids)", { ids })
    .orderBy("p.placement", "ASC")
    .getRawMany<AdPlacementRow>();
  for (const row of rows) {
    groups.get(row.advertisementId)?.push(row.placement);
  }
  return groups;
}

export async function mediaExists(em: EntityManager, id: string): Promise<boolean> {
  return (await em.findOne(Media, { where: { id } })) !== null;
}

/** True when an advertisement already uses the slug (mirrors the DB unique index). */
export async function slugExists(
  em: EntityManager,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const qb = em
    .getRepository(Advertisement)
    .createQueryBuilder("a")
    .select("a.id", "id")
    .where("a.slug = :slug", { slug });
  if (excludeId) qb.andWhere("a.id <> :excludeId", { excludeId });
  return (await qb.getRawOne<{ id: string }>()) !== undefined;
}

/** Loads one advertisement row for update flows. */
export async function findAdById(
  em: EntityManager,
  id: string,
): Promise<Advertisement | undefined> {
  return (await em.findOne(Advertisement, { where: { id } })) ?? undefined;
}

/**
 * Hard-deletes an advertisement. The advertisements table has no deleted_at
 * column, so the schema is left untouched; advertisement_placements rows are
 * removed by the ON DELETE CASCADE foreign key. Returns false when the id
 * does not exist.
 */
export async function deleteAd(em: EntityManager, id: string): Promise<boolean> {
  const result = await em
    .createQueryBuilder()
    .delete()
    .from(Advertisement)
    .where("id = :id", { id })
    .execute();
  return (result.affected ?? 0) > 0;
}