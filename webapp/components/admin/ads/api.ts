/**
 * Client-side Ads API layer for the admin CMS.
 *
 * Reads and writes /api/ads with the existing backend DTOs. The browser
 * session cookie is HttpOnly and sent automatically on same-origin requests;
 * this layer never inspects the cookie and uses credentials "include". Only
 * backend-authored error messages surface to the UI — never SQL errors, stack
 * traces, tokens or internal details.
 */

import type { AdPlacement, AdType } from "@/lib/ads";

export type AdLocale = "bn" | "en";

export interface AdImageDto {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

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
  localized: Record<AdLocale, { name: string; description: string | null }>;
}

export interface AdListParams {
  page?: number;
  limit?: number;
  search?: string;
  placement?: AdPlacement;
  type?: AdType;
  active?: boolean;
  locale?: AdLocale;
}

export interface AdListResult {
  data: AdListItemDto[];
  meta: {
    mode: "public" | "admin";
    locale: AdLocale;
    placement?: AdPlacement;
    limit: number;
    total?: number;
    page?: number;
    totalPages?: number;
  };
}

export interface CreateAdInput {
  slug: string;
  type?: AdType;
  name: Record<AdLocale, string>;
  description?: Partial<Record<AdLocale, string | null>>;
  imageMediaId?: string | null;
  targetUrl: string;
  alt?: string | null;
  active?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  placements: AdPlacement[];
}

export interface UpdateAdInput {
  slug?: string;
  type?: AdType;
  name?: Partial<Record<AdLocale, string>>;
  description?: Partial<Record<AdLocale, string | null>>;
  imageMediaId?: string | null;
  targetUrl?: string;
  alt?: string | null;
  active?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  placements?: AdPlacement[];
}

export interface ApiErrorDetail {
  field: string;
  issues: string[];
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: ApiErrorDetail[] };
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function defaultMessage(status: number): string {
  if (status === 401) {
    return "Sign-in required. Your session may have expired — sign in again and retry.";
  }
  if (status === 403) {
    return "You don't have permission to perform this action.";
  }
  if (status === 404) {
    return "This advertisement no longer exists.";
  }
  if (status === 409) {
    return "An advertisement with this slug already exists. Choose a different slug.";
  }
  if (status === 400) {
    return "The advertisement could not be saved — please review the highlighted fields.";
  }
  return `Request failed (${status}). Please try again.`;
}

async function apiResult<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => null)) as (T & ApiErrorBody) | null;
  if (!response.ok) {
    const error = body?.error;
    throw new ApiRequestError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error?.message ?? defaultMessage(response.status),
      error?.details,
    );
  }
  return body as T;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const adsApi = {
  async list(query: AdListParams = {}): Promise<AdListResult> {
    const response = await apiFetch(
      `/api/ads${buildQueryString({
        page: query.page,
        limit: query.limit,
        search: query.search,
        placement: query.placement,
        type: query.type,
        active: query.active,
        locale: query.locale ?? "en",
      })}`,
    );
    return apiResult<AdListResult>(response);
  },

  async get(id: string): Promise<AdDetailDto> {
    const response = await apiFetch(`/api/ads/${encodeURIComponent(id)}?locale=en`);
    const result = await apiResult<{ data: AdDetailDto }>(response);
    return result.data;
  },

  async create(input: CreateAdInput): Promise<AdDetailDto> {
    const response = await apiFetch("/api/ads", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const result = await apiResult<{ data: AdDetailDto }>(response);
    return result.data;
  },

  async update(id: string, patch: UpdateAdInput): Promise<AdDetailDto> {
    const response = await apiFetch(`/api/ads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    const result = await apiResult<{ data: AdDetailDto }>(response);
    return result.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiFetch(`/api/ads/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await apiResult<undefined>(response);
  },
};

/** Turns any thrown value into a safe, user-facing message. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "Something went wrong. Please try again.";
}

/** Flattens backend validation details into { field: firstIssue } pairs. */
export function fieldErrors(
  details: ApiErrorDetail[] | undefined,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const detail of details ?? []) {
    if (result[detail.field] === undefined && detail.issues.length > 0) {
      result[detail.field] = detail.issues[0];
    }
  }
  return result;
}

/** Resolves the human error for a localized name/description field. */
export function localizedFieldError(
  errors: Record<string, string>,
  locale: AdLocale,
  field: "name" | "description",
): string | undefined {
  return errors[`${field}.${locale}`];
}

/** Resolves the error for a flat form field (slug, type, targetUrl, …). */
export function flatFieldError(
  errors: Record<string, string>,
  field: string,
): string | undefined {
  return errors[field];
}