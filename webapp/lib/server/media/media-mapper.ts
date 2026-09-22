import { MediaType } from "../db/entities/enums";
import type { MediaUsage, MediaDetailDto, MediumDto } from "./media-types";
import type { MediaRow } from "./media-repository";

/**
 * Maps a raw media row to its DTO. size_bytes is a BIGINT (returned by pg as
 * a string) so it is coerced to a JS number; validated inputs guarantee the
 * stored value stays within the safe integer range.
 */
export function toMedium(row: MediaRow): MediumDto {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    storageKey: row.storageKey,
    type: row.type as MediaType,
    mimeType: row.mimeType,
    size: row.sizeBytes === null ? null : Number(row.sizeBytes),
    width: row.width,
    height: row.height,
    alt: row.alt,
    uploaderId: row.uploaderId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toMediaDetail(dto: MediumDto, usage: MediaUsage): MediaDetailDto {
  return { ...dto, usage };
}