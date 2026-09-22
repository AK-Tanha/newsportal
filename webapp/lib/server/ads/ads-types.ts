import type { AdPlacement, AdType, Locale } from "../db/entities/enums";

export const LOCALES: Locale[] = ["bn", "en"];

export const MAX_PUBLIC_LIMIT = 100;
export const MAX_ADMIN_LIMIT = 100;
export const DEFAULT_LIMIT = 100;

export interface AdImageDto {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

/**
 * Shared ad record used by public placements and the admin list. Management
 * fields are only present in admin-mode responses.
 */
export interface AdListItemDto {
  id: string;
  slug: string;
  type: AdType;
  name: string;
  description: string | null;
  image: AdImageDto | null;
  targetUrl: string;
  alt: string | null;
  placements: AdPlacement[];
  /** Management fields, present in admin-mode listings. */
  active?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdDetailDto extends AdListItemDto {
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  imageMediaId: string | null;
  localized: Record<Locale, { name: string; description: string | null }>;
}

/** Payload for POST /api/ads. */
export interface CreateAdInput {
  slug: string;
  type?: AdType;
  name: Record<Locale, string>;
  description?: Partial<Record<Locale, string | null>>;
  imageMediaId?: string | null;
  targetUrl: string;
  alt?: string | null;
  active?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  placements: AdPlacement[];
}

/** Payload for PATCH /api/ads/:id. */
export interface UpdateAdInput {
  slug?: string;
  type?: AdType;
  name?: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string | null>>;
  imageMediaId?: string | null;
  targetUrl?: string;
  alt?: string | null;
  active?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  placements?: AdPlacement[];
}

export interface ListQueryParams {
  locale: Locale;
  mode: "public" | "admin";
  limit: number;
  page?: number;
  placement?: AdPlacement;
  type?: AdType;
  active?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdListResult {
  data: AdListItemDto[];
  meta: {
    mode: "public" | "admin";
    locale: Locale;
    placement?: AdPlacement;
    limit: number;
    total?: number;
    page?: number;
    totalPages?: number;
  };
}