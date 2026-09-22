import type { EntityManager } from "typeorm";
import type { Locale, VideoStatus } from "../db/entities/enums";
import { getInitializedDataSource } from "../db/data-source";
import { Video } from "../db/entities/video";
import { Errors } from "./video-errors";
import { toDetail, toListItem } from "./video-mapper";
import {
  findCategoryIdBySlug,
  findVideoById,
  findVideoDetail,
  findVideos,
  mediaExists,
  slugExists,
  softDeleteVideo,
  userExists,
} from "./video-repository";
import {
  LOCALES,
  encodeCursor,
  type CreateVideoInput,
  type ListQueryParams,
  type UpdateVideoInput,
  type VideoDetailDto,
  type VideoListResult,
  type VideoListItemDto,
} from "./video-types";

function isUniqueViolation(error: unknown): boolean {
  const candidate = error as {
    driverError?: { code?: string };
    code?: string;
  };
  const code = candidate.driverError?.code ?? candidate.code;
  return code === "23505";
}

function iso(value: Date | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function validateReferenceFields(
  em: EntityManager,
  input: Pick<CreateVideoInput, "category" | "authorId" | "posterMediaId">,
): Promise<number> {
  const categoryId = await findCategoryIdBySlug(em, input.category);
  if (!categoryId) throw Errors.categoryNotFound(input.category);
  if (input.authorId !== undefined && input.authorId !== null && !(await userExists(em, input.authorId))) {
    throw Errors.authorNotFound(input.authorId);
  }
  if (
    input.posterMediaId !== undefined &&
    input.posterMediaId !== null &&
    !(await mediaExists(em, input.posterMediaId))
  ) {
    throw Errors.posterMediaNotFound(input.posterMediaId);
  }
  return categoryId;
}

export const videoService = {
  /** Lists videos. Public feeds use keyset pagination; admin feeds use offsets. */
  async listVideos(params: ListQueryParams): Promise<VideoListResult> {
    const ds = await getInitializedDataSource();
    const result = await findVideos(ds.manager, params);

    const data: VideoListItemDto[] = result.rows.map((row) =>
      toListItem(row, params.locale, { admin: params.mode === "admin" }),
    );

    if (params.mode === "public") {
      const last = result.rows[result.rows.length - 1];
      return {
        data,
        meta: {
          mode: "public",
          locale: params.locale,
          limit: params.limit,
          hasNext: result.hasNext,
          nextCursor:
            result.hasNext && last && last.publishedAt
              ? encodeCursor({
                  publishedAt: iso(last.publishedAt) ?? "",
                  id: last.id,
                })
              : undefined,
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
        totalPages: result.count ? Math.ceil(result.count / params.limit) : result.count === 0 ? 0 : 1,
      },
    };
  },

  /**
   * Fetches one video by id. Anonymous callers only ever see published
   * videos; an authenticated admin may fetch drafts as well. Soft-deleted
   * videos (and any other miss) return 404 in both modes. There is no
   * admin restore/recovery flow, so deleted videos stay unreachable.
   */
  async getVideo(
    id: string,
    locale: Locale,
    options: { admin?: boolean } = {},
  ): Promise<VideoDetailDto> {
    const ds = await getInitializedDataSource();
    const raw = await findVideoDetail(ds.manager, { id }, { publicOnly: !options.admin });
    if (!raw) throw Errors.videoNotFound();
    return toDetail(raw, locale);
  },

  /** Fetches one published video by slug (public view). */
  async getVideoBySlug(slug: string, locale: Locale): Promise<VideoDetailDto> {
    const ds = await getInitializedDataSource();
    const raw = await findVideoDetail(ds.manager, { slug }, { publicOnly: true });
    if (!raw) throw Errors.videoNotFound();
    return toDetail(raw, locale);
  },

  /** Creates a video, atomically. */
  async createVideo(
    input: CreateVideoInput,
    options?: { actorId?: string },
  ): Promise<string> {
    const actorId = options?.actorId ?? null;
    const ds = await getInitializedDataSource();
    try {
      return await ds.transaction(async (em) => {
        const categoryId = await validateReferenceFields(em, input);
        if (await slugExists(em, input.slug)) throw Errors.slugConflict(input.slug);

        const status = input.status ?? "draft";
        let publishedAt = input.publishedAt;
        if (status === "published" && !publishedAt) {
          publishedAt = new Date().toISOString();
        }

        // The videos table has no created_by/updated_by audit columns, so
        // author_id doubles as the origin trace: an explicit byline is kept,
        // otherwise the authenticated admin who created the video is recorded.
        const saved = await em.save(
          em.create(Video, {
            slug: input.slug,
            categoryId,
            authorId: input.authorId ?? actorId,
            posterMediaId: input.posterMediaId ?? null,
            titleBn: input.title.bn,
            titleEn: input.title.en,
            summaryBn: input.summary.bn,
            summaryEn: input.summary.en,
            videoUrl: input.videoUrl,
            durationSeconds: input.durationSeconds ?? 0,
            viewsCount: input.viewsCount ?? 0,
            featured: input.featured ?? false,
            status,
            publishedAt: publishedAt ? new Date(publishedAt) : null,
          }),
        );
        return saved.id;
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw Errors.slugConflict(input.slug);
      throw error;
    }
  },

  /** Applies the validated patch to a video atomically. */
  async updateVideo(id: string, input: UpdateVideoInput): Promise<void> {
    const ds = await getInitializedDataSource();
    try {
      await ds.transaction(async (em) => {
        const video = await findVideoById(em, id);
        if (!video) throw Errors.videoNotFound();

        const values: Partial<Video> = {};

        if (input.slug !== undefined) {
          if (input.slug !== video.slug && (await slugExists(em, input.slug, id))) {
            throw Errors.slugConflict(input.slug);
          }
          values.slug = input.slug;
        }
        if (input.category !== undefined) {
          const categoryId = await findCategoryIdBySlug(em, input.category);
          if (!categoryId) throw Errors.categoryNotFound(input.category);
          values.categoryId = categoryId;
        }
        if (input.authorId !== undefined) {
          if (input.authorId !== null && !(await userExists(em, input.authorId))) {
            throw Errors.authorNotFound(input.authorId);
          }
          values.authorId = input.authorId;
        }
        if (input.posterMediaId !== undefined) {
          if (
            input.posterMediaId !== null &&
            !(await mediaExists(em, input.posterMediaId))
          ) {
            throw Errors.posterMediaNotFound(input.posterMediaId);
          }
          values.posterMediaId = input.posterMediaId;
        }
        if (input.videoUrl !== undefined) values.videoUrl = input.videoUrl;
        if (input.durationSeconds !== undefined) values.durationSeconds = input.durationSeconds;
        if (input.viewsCount !== undefined) values.viewsCount = input.viewsCount;
        if (input.featured !== undefined) values.featured = input.featured;
        if (input.status !== undefined) values.status = input.status as VideoStatus;
        if (input.publishedAt !== undefined) {
          values.publishedAt =
            input.publishedAt === null ? null : new Date(input.publishedAt);
        }

        if (input.title) {
          for (const locale of LOCALES) {
            const title = input.title[locale];
            if (title === undefined) continue;
            if (locale === "bn") values.titleBn = title;
            else values.titleEn = title;
          }
        }
        if (input.summary) {
          for (const locale of LOCALES) {
            const summary = input.summary[locale];
            if (summary === undefined) continue;
            if (locale === "bn") values.summaryBn = summary;
            else values.summaryEn = summary;
          }
        }

        const nextStatus = values.status ?? video.status;
        const nextPublishedAt =
          values.publishedAt === undefined ? video.publishedAt : values.publishedAt;
        if (nextStatus === "published" && !nextPublishedAt) {
          values.publishedAt = new Date();
        }

        if (Object.keys(values).length > 0) {
          await em.update(Video, id, values);
        }
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw Errors.slugConflict(input.slug ?? "");
      throw error;
    }
  },

  /** Soft-deletes a video by stamping deleted_at. */
  async deleteVideo(id: string): Promise<void> {
    const ds = await getInitializedDataSource();
    const deleted = await softDeleteVideo(ds.manager, id);
    if (!deleted) throw Errors.videoNotFound();
  },
};