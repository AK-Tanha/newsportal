import type { MediaType } from "../db/entities/enums";

export const MEDIA_TYPES: MediaType[] = ["image", "video"];

export const MAX_ADMIN_LIMIT = 100;
export const DEFAULT_LIMIT = 20;

export interface MediumDto {
  id: string;
  filename: string;
  url: string;
  storageKey: string | null;
  type: MediaType;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  alt: string | null;
  uploaderId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** How many live records reference this media row, per content type. */
export interface MediaUsage {
  articles: number;
  videos: number;
  liveStreams: number;
  advertisements: number;
}

export interface MediaDetailDto extends MediumDto {
  usage: MediaUsage;
}

/** Payload for POST /api/media. Metadata only — the URL is never fetched. */
export interface CreateMediaInput {
  filename: string;
  url: string;
  storageKey?: string | null;
  type?: MediaType;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

/** Payload for PATCH /api/media/:id. */
export interface UpdateMediaInput {
  filename?: string;
  url?: string;
  storageKey?: string | null;
  type?: MediaType;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

export interface ListQueryParams {
  page: number;
  limit: number;
  search?: string;
  type?: MediaType;
}

export interface MediaListResult {
  data: MediumDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}