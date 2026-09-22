import type { EntityManager } from "typeorm";
import { Advertisement } from "../db/entities/advertisement";
import { AdvertisementPlacement } from "../db/entities/advertisement-placement";
import { type Locale } from "../db/entities/enums";
import type { AdPlacement } from "../db/entities/enums";
import { getInitializedDataSource } from "../db/data-source";
import { Errors } from "./ads-errors";
import { toDetail, toListItem } from "./ads-mapper";
import { LOCALES } from "./ads-types";
import {
  deleteAd,
  findAdById,
  findAdDetail,
  findAds,
  findPlacementsForAds,
  mediaExists,
  slugExists,
} from "./ads-repository";
import type {
  AdDetailDto,
  AdListResult,
  AdListItemDto,
  CreateAdInput,
  ListQueryParams,
  UpdateAdInput,
} from "./ads-types";

/** Returns the Postgres unique-constraint name behind a 23505 violation. */
function constraintName(error: unknown): string | undefined {
  const candidate = error as {
    driverError?: { code?: string; constraint?: string };
    code?: string;
    constraint?: string;
  };
  if ((candidate.driverError?.code ?? candidate.code) !== "23505") return undefined;
  return candidate.driverError?.constraint ?? candidate.constraint;
}

/** Validates the optional image media reference. */
async function validateImageMedia(
  em: EntityManager,
  imageMediaId: string | null | undefined,
): Promise<void> {
  if (
    imageMediaId !== undefined &&
    imageMediaId !== null &&
    !(await mediaExists(em, imageMediaId))
  ) {
    throw Errors.mediaNotFound(imageMediaId);
  }
}

/**
 * Rejects an end date earlier than the start date. For updates the effective
 * window is the merge of the patch and the existing row, so the check uses
 * the resolved values.
 */
function assertValidDateRange(
  startDate: string | null,
  endDate: string | null,
): void {
  if (startDate && endDate && endDate < startDate) {
    throw Errors.invalidDateRange();
  }
}

/**
 * Replaces the complete placement set for an advertisement inside the same
 * transaction as the ad write, deleting the previous rows and inserting the
 * supplied set. The composite PRIMARY KEY (advertisement_id, placement)
 * prevents duplicate relationships.
 */
async function replacePlacements(
  em: EntityManager,
  advertisementId: string,
  placements: AdPlacement[],
): Promise<void> {
  await em
    .createQueryBuilder()
    .delete()
    .from(AdvertisementPlacement)
    .where("advertisement_id = :advertisementId", { advertisementId })
    .execute();
  for (const placement of placements) {
    await em.save(
      em.create(AdvertisementPlacement, { advertisementId, placement }),
    );
  }
}

/**
 * Future caching hook. The public placement queries are cheap and fully
 * database-filtered, so no cache exists yet. Caching can be added later
 * WITHOUT touching the repository by wrapping the public `listAds`/`getAd`
 * calls at this boundary with a `placement + locale + calendar-day bucket`
 * key (advertisements only gain or lose eligibility when is_active changes or
 * at date boundaries, so a day-bucketed short-TTL cache is correct). An ad
 * mutation would bust only its own placements' buckets. Do NOT cache
 * indefinitely and do NOT add Redis now.
 */
export const adsService = {
  /**
   * Lists advertisements. Public mode returns only currently-eligible ads
   * (active flag + date window + optional placement), filtered entirely in
   * the database. Admin mode returns an offset page with a total count.
   */
  async listAds(params: ListQueryParams): Promise<AdListResult> {
    const ds = await getInitializedDataSource();
    const result = await findAds(ds.manager, params);
    const placements = await findPlacementsForAds(
      ds.manager,
      result.rows.map((row) => row.id),
    );

    const data: AdListItemDto[] = result.rows.map((row) =>
      toListItem(row, params.locale, placements.get(row.id) ?? [], {
        admin: params.mode === "admin",
      }),
    );

    if (params.mode === "public") {
      return {
        data,
        meta: {
          mode: "public",
          locale: params.locale,
          placement: params.placement,
          limit: params.limit,
          total: data.length,
        },
      };
    }

    return {
      data,
      meta: {
        mode: "admin",
        locale: params.locale,
        limit: params.limit,
        total: result.count,
        page: params.page ?? 1,
        totalPages: result.count
          ? Math.ceil(result.count / params.limit)
          : result.count === 0
            ? 0
            : 1,
      },
    };
  },

  /** Fetches one advertisement by id, regardless of eligibility (management view). */
  async getAd(id: string, locale: Locale): Promise<AdDetailDto> {
    const ds = await getInitializedDataSource();
    const raw = await findAdDetail(ds.manager, id);
    if (!raw) throw Errors.adNotFound();
    const placements = await findPlacementsForAds(ds.manager, [id]);
    return toDetail(raw, locale, placements.get(id) ?? []);
  },

  /** Creates an advertisement with its placements, atomically. */
  async createAd(input: CreateAdInput): Promise<string> {
    const ds = await getInitializedDataSource();
    const placements = input.placements ?? [];
    try {
      return await ds.transaction(async (em) => {
        if (await slugExists(em, input.slug)) throw Errors.slugConflict(input.slug);
        await validateImageMedia(em, input.imageMediaId);
        const startDate = input.startDate ?? null;
        const endDate = input.endDate ?? null;
        assertValidDateRange(startDate, endDate);

        const saved = await em.save(
          em.create(Advertisement, {
            slug: input.slug,
            type: input.type ?? "banner",
            titleBn: input.name.bn,
            titleEn: input.name.en,
            descriptionBn: input.description?.bn ?? null,
            descriptionEn: input.description?.en ?? null,
            imageMediaId: input.imageMediaId ?? null,
            targetUrl: input.targetUrl,
            alt: input.alt ?? null,
            isActive: input.active ?? true,
            startDate,
            endDate,
          }),
        );

        if (placements.length > 0) {
          await replacePlacements(em, saved.id, placements);
        }
        return saved.id;
      });
    } catch (error) {
      const constraint = constraintName(error);
      if (constraint === "uq_advertisements_slug") throw Errors.slugConflict(input.slug);
      throw error;
    }
  },

  /** Applies the validated patch to an advertisement atomically. */
  async updateAd(id: string, input: UpdateAdInput): Promise<void> {
    const ds = await getInitializedDataSource();
    try {
      await ds.transaction(async (em) => {
        const ad = await findAdById(em, id);
        if (!ad) throw Errors.adNotFound();

        const values: Partial<Advertisement> = {};

        if (input.slug !== undefined) {
          if (input.slug !== ad.slug && (await slugExists(em, input.slug, id))) {
            throw Errors.slugConflict(input.slug);
          }
          values.slug = input.slug;
        }
        if (input.type !== undefined) values.type = input.type;
        if (input.targetUrl !== undefined) values.targetUrl = input.targetUrl;
        if (input.alt !== undefined) values.alt = input.alt;
        if (input.active !== undefined) values.isActive = input.active;

        if (input.imageMediaId !== undefined) {
          await validateImageMedia(em, input.imageMediaId);
          values.imageMediaId = input.imageMediaId;
        }

        if (input.name) {
          for (const locale of LOCALES) {
            const name = input.name[locale];
            if (name === undefined) continue;
            if (locale === "bn") values.titleBn = name;
            else values.titleEn = name;
          }
        }
        if (input.description) {
          for (const locale of LOCALES) {
            const description = input.description[locale];
            if (description === undefined) continue;
            if (locale === "bn") values.descriptionBn = description;
            else values.descriptionEn = description;
          }
        }

        const nextStartDate =
          input.startDate !== undefined ? input.startDate : ad.startDate ?? null;
        const nextEndDate =
          input.endDate !== undefined ? input.endDate : ad.endDate ?? null;
        assertValidDateRange(nextStartDate, nextEndDate);

        if (input.startDate !== undefined) values.startDate = input.startDate;
        if (input.endDate !== undefined) values.endDate = input.endDate;

        if (Object.keys(values).length > 0) {
          await em.update(Advertisement, id, values);
        }

        if (input.placements !== undefined) {
          await replacePlacements(em, id, input.placements);
        }
      });
    } catch (error) {
      const constraint = constraintName(error);
      if (constraint === "uq_advertisements_slug") throw Errors.slugConflict(input.slug ?? "");
      throw error;
    }
  },

  /**
   * Hard-deletes an advertisement: the advertisements table has no deleted_at
   * column, so the schema is left untouched. Placement rows cascade away and
   * the ad can no longer appear in public eligible-ad queries.
   */
  async deleteAd(id: string): Promise<void> {
    const ds = await getInitializedDataSource();
    const deleted = await deleteAd(ds.manager, id);
    if (!deleted) throw Errors.adNotFound();
  },
};