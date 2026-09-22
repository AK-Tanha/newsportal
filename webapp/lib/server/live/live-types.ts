import type { LiveStatus, Locale } from "../db/entities/enums";

export const LOCALES: Locale[] = ["bn", "en"];

export const MAX_PUBLIC_LIMIT = 100;
export const MAX_ADMIN_LIMIT = 100;
export const DEFAULT_LIMIT = 100;

export interface LivePosterDto {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

/** Shared list/detail live-stream record returned by the API. */
export interface LiveListItemDto {
  id: string;
  slug: string;
  category: { slug: string; name: string; color: string };
  title: string;
  description: string;
  streamUrl: string | null;
  poster: LivePosterDto | null;
  status: LiveStatus;
  startedAt: string | null;
  viewerCount: number;
  /** Management fields, present in admin-mode listings. */
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveDetailDto extends LiveListItemDto {
  active: boolean;
  createdAt: string;
  updatedAt: string;
  localized: Record<Locale, { title: string; description: string }>;
}

/** Payload for POST /api/live. */
export interface CreateLiveInput {
  slug: string;
  category: string;
  posterMediaId?: string | null;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  streamUrl?: string | null;
  status?: LiveStatus;
  active?: boolean;
  startedAt?: string | null;
  viewerCount?: number;
}

/** Payload for PATCH /api/live/:id. */
export interface UpdateLiveInput {
  slug?: string;
  category?: string;
  posterMediaId?: string | null;
  title?: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  streamUrl?: string | null;
  status?: LiveStatus;
  active?: boolean;
  startedAt?: string | null;
  viewerCount?: number;
}

export interface ListQueryParams {
  locale: Locale;
  mode: "public" | "admin";
  limit: number;
  page?: number;
  status?: LiveStatus;
  active?: boolean;
  categorySlug?: string;
}

export interface LiveListResult {
  data: LiveListItemDto[];
  meta: {
    mode: "public" | "admin";
    locale: Locale;
    limit: number;
    total?: number;
    page?: number;
    totalPages?: number;
  };
}

/** The public active-stream endpoint returns this exact shape when NO stream is live. */
export const NO_ACTIVE_STREAM: { data: null; meta: { hasActive: boolean } } = {
  data: null,
  meta: { hasActive: false },
};