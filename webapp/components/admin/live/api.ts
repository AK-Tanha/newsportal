"use client";

import type { Locale } from "@/lib/locales";
import type { LiveStatus } from "@/lib/live";
import type { CategorySlug } from "@/lib/news";

export { type Locale };
export type { LiveStatus };

/** A poster resolved through the media library. */
export interface LivePosterDto {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

/** The localized title/description bundle the backend stores per locale. */
export type LocalizedText = { bn: string; en: string };

export interface LiveListItemDto {
  id: string;
  slug: string;
  category: { slug: string; name: string; color: string };
  title: string;
  poster: LivePosterDto | null;
  streamUrl: string | null;
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

export interface LiveListParams {
  page?: number;
  limit?: number;
  status?: LiveStatus;
  active?: boolean;
  category?: string;
  search?: string;
  locale?: Locale;
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

export interface ActiveStreamResult {
  data: LiveDetailDto | null;
  meta: { hasActive: boolean };
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
    return "This live stream no longer exists.";
  }
  if (status === 409) {
    return "There is already a stream with this slug, or another stream is active.";
  }
  if (status === 400) {
    return "The live stream could not be saved — please review the highlighted fields.";
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

export const liveApi = {
  /** Admin-mode listing of live streams (paged, with management fields). */
  async list(query: LiveListParams = {}): Promise<LiveListResult> {
    const response = await apiFetch(
      `/api/live${buildQueryString({
        page: query.page,
        limit: query.limit,
        status: query.status,
        active: query.active,
        category: query.category,
        search: query.search,
        locale: query.locale ?? "bn",
      })}`,
    );
    return apiResult<LiveListResult>(response);
  },

  /** The public active-stream endpoint (null when no stream is live). */
  async active(locale?: Locale): Promise<ActiveStreamResult> {
    const response = await apiFetch(
      `/api/live/active${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`,
    );
    return apiResult<ActiveStreamResult>(response);
  },

  async get(id: string, locale?: Locale): Promise<LiveDetailDto> {
    const response = await apiFetch(
      `/api/live/${encodeURIComponent(id)}${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`,
    );
    const result = await apiResult<{ data: LiveDetailDto }>(response);
    return result.data;
  },

  async create(input: CreateLiveInput): Promise<LiveDetailDto> {
    const response = await apiFetch("/api/live", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const result = await apiResult<{ data: LiveDetailDto }>(response);
    return result.data;
  },

  async update(id: string, patch: UpdateLiveInput): Promise<LiveDetailDto> {
    const response = await apiFetch(`/api/live/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    const result = await apiResult<{ data: LiveDetailDto }>(response);
    return result.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiFetch(`/api/live/${encodeURIComponent(id)}`, {
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

/** Resolves the human error for a localized title/description field. */
export function localizedFieldError(
  errors: Record<string, string>,
  locale: Locale,
  field: "title" | "description",
): string | undefined {
  return errors[`${field}.${locale}`];
}

/** Resolves the error for a flat form field (slug, category, streamUrl, …). */
export function flatFieldError(
  errors: Record<string, string>,
  field: string,
): string | undefined {
  return errors[field];
}
