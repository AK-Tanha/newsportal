/**
 * Client-side Articles API layer for the admin CMS.
 *
 * Reads and writes /api/articles with the existing backend DTOs. The browser
 * session cookie is HttpOnly and sent automatically on same-origin requests;
 * this layer never inspects the cookie. The backend remains the authoritative
 * validator — this module only shapes requests and surfaces structured errors.
 */

export type ArticleStatus = "draft" | "published";
export type ArticleLocale = "bn" | "en";

export interface ArticleLocalizedContent {
  title: string;
  summary: string;
  body: string;
  readTimeMinutes: number | null;
}

export interface ArticleSummaryDto {
  id: string;
  slug: string;
  category: { slug: string; name: string; color: string };
  title: string;
  summary: string;
  image: { url: string; alt: string | null } | null;
  author: { id: string; name: string } | null;
  readTimeMinutes: number | null;
  publishedAt: string | null;
  featured: boolean;
  breaking: boolean;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDetailDto extends ArticleSummaryDto {
  tags: { slug: string; name: string }[];
  content: Record<ArticleLocale, ArticleLocalizedContent>;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  category?: string;
  search?: string;
  locale?: ArticleLocale;
}

export interface ArticleListResult {
  data: ArticleSummaryDto[];
  meta: {
    mode: "public" | "admin";
    locale: ArticleLocale;
    limit: number;
    total?: number;
    page?: number;
  };
}

export interface ArticleContentInput {
  title: string;
  summary: string;
  body: string;
}

export interface CreateArticleInput {
  slug: string;
  category: string;
  authorId?: string | null;
  status?: ArticleStatus;
  isFeatured?: boolean;
  isBreaking?: boolean;
  publishedAt?: string | null;
  content: Record<ArticleLocale, ArticleContentInput>;
  tags?: string[];
}

export type UpdateArticleInput = Partial<
  Omit<CreateArticleInput, "content">
> & {
  content?: Partial<Record<ArticleLocale, ArticleContentInput>>;
};

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
    return "This article no longer exists.";
  }
  if (status === 409) {
    return "This could not be saved because it conflicts with an existing article.";
  }
  if (status === 400) {
    return "The article could not be saved — please review the highlighted fields.";
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
    headers: {
      ...(init?.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const articlesApi = {
  async list(query: ArticleListParams = {}): Promise<ArticleListResult> {
    const response = await apiFetch(
      `/api/articles${buildQueryString({
        page: query.page,
        limit: query.limit,
        status: query.status,
        category: query.category,
        search: query.search,
        locale: query.locale ?? "en",
      })}`,
    );
    return apiResult<ArticleListResult>(response);
  },

  async get(id: string): Promise<ArticleDetailDto> {
    const response = await apiFetch(`/api/articles/${encodeURIComponent(id)}?locale=en`);
    const result = await apiResult<{ data: ArticleDetailDto }>(response);
    return result.data;
  },

  async create(input: CreateArticleInput): Promise<ArticleDetailDto> {
    const response = await apiFetch("/api/articles", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const result = await apiResult<{ data: ArticleDetailDto }>(response);
    return result.data;
  },

  async update(id: string, patch: UpdateArticleInput): Promise<ArticleDetailDto> {
    const response = await apiFetch(`/api/articles/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    const result = await apiResult<{ data: ArticleDetailDto }>(response);
    return result.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiFetch(`/api/articles/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await apiResult<undefined>(response);
  },
};

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "editor";
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await apiFetch("/api/auth/me");
  const result = await apiResult<{ data: { user: CurrentUser } }>(response);
  return result.data.user;
}

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

/** Resolves the human error for a localized content field. */
export function contentFieldError(
  errors: Record<string, string>,
  locale: ArticleLocale,
  field: "title" | "summary" | "body",
): string | undefined {
  return errors[`content.${locale}.${field}`] ?? errors[`content.${locale}`];
}