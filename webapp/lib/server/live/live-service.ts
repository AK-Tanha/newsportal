import type { EntityManager } from "typeorm";
import type { LiveStatus, Locale } from "../db/entities/enums";
import { getInitializedDataSource } from "../db/data-source";
import { LiveStream } from "../db/entities/live-stream";
import { Errors } from "./live-errors";
import { toDetail, toListItem } from "./live-mapper";
import {
  deleteLiveStream,
  findActiveStream,
  findCategoryIdBySlug,
  findLiveById,
  findLiveDetail,
  findLiveStreams,
  mediaExists,
  slugExists,
} from "./live-repository";
import {
  LOCALES,
  NO_ACTIVE_STREAM,
  type CreateLiveInput,
  type ListQueryParams,
  type LiveDetailDto,
  type LiveListResult,
  type LiveListItemDto,
  type UpdateLiveInput,
} from "./live-types";

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

/**
 * Resolves the requested status/active pair into coherent effective values.
 * `is_active` is the single-active gate enforced by the partial unique index
 * `uq_live_streams_single_active`; status follows it. Configuring active=true
 * while status=offline (or vice versa) is rejected.
 */
function resolveLiveState(
  status: LiveStatus | undefined,
  active: boolean | undefined,
  currentActive: boolean,
): { status: LiveStatus; active: boolean } {
  let nextStatus: LiveStatus;
  let nextActive: boolean;
  if (status !== undefined && active !== undefined) {
    nextStatus = status;
    nextActive = active;
  } else if (status !== undefined) {
    nextStatus = status;
    nextActive = status === "live";
  } else if (active !== undefined) {
    nextActive = active;
    nextStatus = active ? "live" : "offline";
  } else {
    nextStatus = currentActive ? "live" : "offline";
    nextActive = currentActive;
  }
  if (nextActive && nextStatus !== "live") {
    throw Errors.validation([
      { field: "active", issues: ["active cannot be true when status is offline."] },
    ]);
  }
  if (!nextActive && nextStatus === "live") {
    throw Errors.validation([
      { field: "active", issues: ["active cannot be false when status is live."] },
    ]);
  }
  return { status: nextStatus, active: nextActive };
}

async function validateReferenceFields(
  em: EntityManager,
  input: Pick<CreateLiveInput, "category" | "posterMediaId">,
): Promise<number> {
  const categoryId = await findCategoryIdBySlug(em, input.category);
  if (!categoryId) throw Errors.categoryNotFound(input.category);
  if (
    input.posterMediaId !== undefined &&
    input.posterMediaId !== null &&
    !(await mediaExists(em, input.posterMediaId))
  ) {
    throw Errors.posterMediaNotFound(input.posterMediaId);
  }
  return categoryId;
}

export const liveService = {
  /**
   * Lists live streams. Public mode returns the full ordered set (active
   * first) capped at the limit; admin mode returns an offset page with a
   * total count. The dataset is tiny, so no keyset machinery is used here.
   */
  async listStreams(params: ListQueryParams): Promise<LiveListResult> {
    const ds = await getInitializedDataSource();
    const result = await findLiveStreams(ds.manager, params);

    const data: LiveListItemDto[] = result.rows.map((row) =>
      toListItem(row, params.locale, { admin: params.mode === "admin" }),
    );

    if (params.mode === "public") {
      return {
        data,
        meta: { mode: "public", locale: params.locale, limit: params.limit, total: data.length },
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

  /**
   * Returns the currently active stream, or the canonical empty response
   * (NO STREAM) when no stream is live. Read-only: viewer counts are never
   * touched.
   */
  async getActiveStream(locale: Locale): Promise<
    { data: LiveDetailDto; meta: { hasActive: boolean } } | typeof NO_ACTIVE_STREAM
  > {
    const ds = await getInitializedDataSource();
    const raw = await findActiveStream(ds.manager);
    if (!raw) return NO_ACTIVE_STREAM;
    return { data: toDetail(raw, locale), meta: { hasActive: true } };
  },

  /** Fetches one stream by id, regardless of status (management view). */
  async getStream(id: string, locale: Locale): Promise<LiveDetailDto> {
    const ds = await getInitializedDataSource();
    const raw = await findLiveDetail(ds.manager, id);
    if (!raw) throw Errors.liveNotFound();
    return toDetail(raw, locale);
  },

  /** Creates a live stream, atomically. */
  async createStream(input: CreateLiveInput): Promise<string> {
    const ds = await getInitializedDataSource();
    try {
      return await ds.transaction(async (em) => {
        const categoryId = await validateReferenceFields(em, input);
        if (await slugExists(em, input.slug)) throw Errors.slugConflict(input.slug);

        const { status, active } = resolveLiveState(input.status, input.active, false);
        const startedAt = active && !input.startedAt
          ? new Date()
          : input.startedAt
            ? new Date(input.startedAt)
            : null;

        const saved = await em.save(
          em.create(LiveStream, {
            slug: input.slug,
            categoryId,
            posterMediaId: input.posterMediaId ?? null,
            titleBn: input.title.bn,
            titleEn: input.title.en,
            descriptionBn: input.description.bn,
            descriptionEn: input.description.en,
            streamUrl: input.streamUrl ?? null,
            isActive: active,
            status,
            startedAt,
            viewerCount: input.viewerCount ?? 0,
          }),
        );
        return saved.id;
      });
    } catch (error) {
      const constraint = constraintName(error);
      if (constraint === "uq_live_streams_slug") throw Errors.slugConflict(input.slug);
      if (constraint === "uq_live_streams_single_active") throw Errors.activeConflict();
      throw error;
    }
  },

  /**
   * Applies the validated patch to a live stream atomically. Going live is
   * gated by the partial unique index on is_active; a second active stream
   * surfaces as a 23505 on uq_live_streams_single_active and is mapped to a
   * 409 without touching the currently-active stream.
   */
  async updateStream(id: string, input: UpdateLiveInput): Promise<void> {
    const ds = await getInitializedDataSource();
    try {
      await ds.transaction(async (em) => {
        const stream = await findLiveById(em, id);
        if (!stream) throw Errors.liveNotFound();

        const { status, active } = resolveLiveState(
          input.status,
          input.active,
          stream.isActive,
        );
        const wasActive = stream.isActive;

        const values: Partial<LiveStream> = {};

        if (input.slug !== undefined) {
          if (input.slug !== stream.slug && (await slugExists(em, input.slug, id))) {
            throw Errors.slugConflict(input.slug);
          }
          values.slug = input.slug;
        }
        if (input.category !== undefined) {
          const categoryId = await findCategoryIdBySlug(em, input.category);
          if (!categoryId) throw Errors.categoryNotFound(input.category);
          values.categoryId = categoryId;
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
        if (input.streamUrl !== undefined) values.streamUrl = input.streamUrl;
        if (input.startedAt !== undefined) {
          values.startedAt = input.startedAt === null ? null : new Date(input.startedAt);
        }
        if (input.viewerCount !== undefined) values.viewerCount = input.viewerCount;

        values.status = status;
        values.isActive = active;
        if (active && !wasActive && input.startedAt === undefined) {
          values.startedAt = new Date();
        }

        if (input.title) {
          for (const locale of LOCALES) {
            const title = input.title[locale];
            if (title === undefined) continue;
            if (locale === "bn") values.titleBn = title;
            else values.titleEn = title;
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

        await em.update(LiveStream, id, values);
      });
    } catch (error) {
      const constraint = constraintName(error);
      if (constraint === "uq_live_streams_slug") throw Errors.slugConflict(input.slug ?? "");
      if (constraint === "uq_live_streams_single_active") throw Errors.activeConflict();
      throw error;
    }
  },

  /**
   * Hard-deletes a live stream: the live_streams table has no deleted_at
   * column and the schema is not modified to force soft deletion. Removing
   * the active stream leaves no active stream, so /api/live/active naturally
   * reports NO STREAM afterwards.
   */
  async deleteStream(id: string): Promise<void> {
    const ds = await getInitializedDataSource();
    const deleted = await deleteLiveStream(ds.manager, id);
    if (!deleted) throw Errors.liveNotFound();
  },
};