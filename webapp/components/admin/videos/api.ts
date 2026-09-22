/**
 * Client-side Videos API layer for the admin CMS.
 *
 * Reads and writes /api/videos with the existing backend DTOs. The browser
 * session cookie is HttpOnly and sent automatically on same-origin requests;
 * this layer never inspects the cookie, and uses credentials "include" for
 * same-site requests. Only backend-authored error messages surface to the UI
 * — never SQL errors, stack traces, tokens or internal details.
 */

export type VideoStatus = "draft" | "published";
export type VideoLocale = "bn" | "en";

export interface VideoPosterDto {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface VideoCategoryDto {
  slug: string;
  name: string;
  color: string;
}

export interface VideoSummaryDto {
  id: string;
  slug: string;
  category: VideoCategoryDto;
  title: string;
  summary: string;
  poster: VideoPosterDto | null;
  durationSeconds: number;
  viewsCount: number;
  featured: boolean;
  publishedAt: string | null;
  /** Management fields, present in admin-mode listings. */
  status?: VideoStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoDetailDto extends VideoSummaryDto {
  videoUrl: string;
  status: VideoStatus;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string } | null;
  localized: Record<VideoLocale, { title: string; summary: string }>;
}

export interface VideoListParams {
  page?: number;
  limit?: number;
  status?: VideoStatus;
  category?: string;
  search?: string;
  featured?: boolean;
  locale?: VideoLocale;
}

export interface VideoListResult {
  data: VideoSummaryDto[];
  meta: {
    mode: "public" | "admin";
    locale: VideoLocale;
    limit: number;
    total?: number;
    page?: number;
    totalPages?: number;
  };
}

export interface CreateVideoInput {
  slug: string;
  category: string;
  authorId?: string | null;
  posterMediaId?: string | null;
  title: Record<VideoLocale, string>;
  summary: Record<VideoLocale, string>;
  videoUrl: string;
  durationSeconds?: number;
  viewsCount?: number;
  featured?: boolean;
  status?: VideoStatus;
  publishedAt?: string | null;
}

export interface UpdateVideoInput {
  slug?: string;
  category?: string;
  authorId?: string | null;
  posterMediaId?: string | null;
  title?: Partial<Record<VideoLocale, string>>;
  summary?: Partial<Record<VideoLocale, string>>;
  videoUrl?: string;
  durationSeconds?: number;
  viewsCount?: number;
  featured?: boolean;
  status?: VideoStatus;
  publishedAt?: string | null;
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
    return "This video no longer exists.";
  }
  if (status === 409) {
    return "A video with this slug already exists. Choose a different slug.";
  }
  if (status === 400) {
    return "The video could not be saved — please review the highlighted fields.";
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

export const videosApi = {
  async list(query: VideoListParams = {}): Promise<VideoListResult> {
    const response = await apiFetch(
      `/api/videos${buildQueryString({
        page: query.page,
        limit: query.limit,
        status: query.status,
        category: query.category,
        search: query.search,
        locale: query.locale ?? "en",
      })}`,
    );
    return apiResult<VideoListResult>(response);
  },

  async get(id: string): Promise<VideoDetailDto> {
    const response = await apiFetch(`/api/videos/${encodeURIComponent(id)}?locale=en`);
    const result = await apiResult<{ data: VideoDetailDto }>(response);
    return result.data;
  },

  async create(input: CreateVideoInput): Promise<VideoDetailDto> {
    const response = await apiFetch("/api/videos", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const result = await apiResult<{ data: VideoDetailDto }>(response);
    return result.data;
  },

  async update(id: string, patch: UpdateVideoInput): Promise<VideoDetailDto> {
    const response = await apiFetch(`/api/videos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    const result = await apiResult<{ data: VideoDetailDto }>(response);
    return result.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiFetch(`/api/videos/${encodeURIComponent(id)}`, {
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

/** Resolves the human error for a localized title/summary field. */
export function localizedFieldError(
  errors: Record<string, string>,
  locale: VideoLocale,
  field: "title" | "summary",
): string | undefined {
  return errors[`${field}.${locale}`];
}

/** Resolves the error for a flat form field (slug, category, videoUrl, …). */
export function flatFieldError(
  errors: Record<string, string>,
  field: string,
): string | undefined {
  return errors[field];
}