import { Media } from "../db/entities/media";
import { getInitializedDataSource } from "../db/data-source";
import { Errors } from "./media-errors";
import { toMediaDetail, toMedium } from "./media-mapper";
import {
  countMediaUsage,
  deleteMedia as deleteMediaRow,
  findMedia,
  findMediaById,
} from "./media-repository";
import type {
  CreateMediaInput,
  MediaDetailDto,
  MediaListResult,
  UpdateMediaInput,
} from "./media-types";
import type { ListQueryParams } from "./media-types";

export const mediaService = {
  async listMedia(params: ListQueryParams): Promise<MediaListResult> {
    const ds = await getInitializedDataSource();
    const { rows, count } = await findMedia(ds.manager, params);
    const totalPages = Math.max(1, Math.ceil(count / params.limit));
    return {
      data: rows.map(toMedium),
      meta: {
        page: params.page,
        limit: params.limit,
        total: count,
        totalPages,
      },
    };
  },

  async getMedia(id: string): Promise<MediaDetailDto> {
    const ds = await getInitializedDataSource();
    const row = await findMediaById(ds.manager, id);
    if (!row) throw Errors.mediaNotFound();
    const usage = await countMediaUsage(ds.manager, id);
    return toMediaDetail(toMedium(row), usage);
  },

  /**
   * Creates a metadata-only media record. The URL is validated syntactically
   * and stored as-is; it is never fetched. There is no unique constraint on
   * url, so duplicate URLs are allowed (documented). uploaderId is not part
   * of the client payload — the authenticated admin who uploads is stamped
   * server-side from the session.
   */
  async createMedia(
    input: CreateMediaInput,
    options?: { actorId?: string },
  ): Promise<MediaDetailDto> {
    const ds = await getInitializedDataSource();
    const em = ds.manager;
    const result = await em.save(
      em.create(Media, {
        filename: input.filename,
        url: input.url,
        storageKey: input.storageKey ?? null,
        type: input.type ?? "image",
        mimeType: input.mimeType ?? null,
        sizeBytes: input.size === undefined ? null : String(input.size),
        width: input.width ?? null,
        height: input.height ?? null,
        alt: input.alt ?? null,
        uploaderId: options?.actorId ?? null,
      }),
    );
    const id = String(result.id);
    const row = await findMediaById(em, id);
    if (!row) throw Errors.mediaNotFound();
    const usage = await countMediaUsage(em, id);
    return toMediaDetail(toMedium(row), usage);
  },

  /**
   * Updates mutable metadata fields. Changing url is allowed because content
   * references media by id, so a URL correction never breaks references (the
   * frontend re-resolves files from the media library). Explicit null clears
   * the nullable columns (storageKey, mimeType, size, width, height, alt).
   */
  async updateMedia(
    id: string,
    input: UpdateMediaInput,
  ): Promise<MediaDetailDto> {
    const ds = await getInitializedDataSource();
    const em = ds.manager;
    const existing = await em.findOne(Media, { where: { id } });
    if (!existing) throw Errors.mediaNotFound();

    const patch: Partial<Media> = {};
    if (input.filename !== undefined) patch.filename = input.filename;
    if (input.url !== undefined) patch.url = input.url;
    if (input.storageKey !== undefined) patch.storageKey = input.storageKey;
    if (input.type !== undefined) patch.type = input.type;
    if (input.mimeType !== undefined) patch.mimeType = input.mimeType;
    if (input.size !== undefined)
      patch.sizeBytes = input.size === null ? null : String(input.size);
    if (input.width !== undefined) patch.width = input.width;
    if (input.height !== undefined) patch.height = input.height;
    if (input.alt !== undefined) patch.alt = input.alt;

    await em.update(Media, id, patch);

    const row = await findMediaById(em, id);
    if (!row) throw Errors.mediaNotFound();
    const usage = await countMediaUsage(em, id);
    return toMediaDetail(toMedium(row), usage);
  },

  /**
   * Deletes media by id. Every referencing FK uses ON DELETE SET NULL, so
   * references become NULL and no content rows are harmed.
   */
  async deleteMedia(id: string): Promise<void> {
    const ds = await getInitializedDataSource();
    const deleted = await deleteMediaRow(ds.manager, id);
    if (!deleted) throw Errors.mediaNotFound();
  },
};