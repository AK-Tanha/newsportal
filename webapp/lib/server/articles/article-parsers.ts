import type { NextRequest } from "next/server";
import type { ArticleStatus, Locale } from "../db/entities/enums";
import { ApiError, Errors, type ErrorDetails } from "./article-errors";
import {
  DEFAULT_LIMIT,
  type ArticleCursor,
  type CreateArticleInput,
  type LocalizedContentInput,
  type UpdateArticleInput,
  decodeCursor,
} from "./article-types";

const STATUSES: ArticleStatus[] = ["draft", "published"];
const LOCALES: Locale[] = ["bn", "en"];

const POSITIVE_INT = /^[1-9]\d*$/;
const SLUG_PATTERN = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseLocale(raw: string | null): Locale {
  return raw === "en" ? "en" : "bn";
}

export function parseLimit(raw: string | null, max: number): number {
  if (raw === null || raw === "") return DEFAULT_LIMIT;
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.validation([{ field: "limit", issues: ["Must be a positive integer."] }]);
  }
  const value = Number(raw);
  if (value < 1 || value > max) {
    throw Errors.validation([
      { field: "limit", issues: [`Must be between 1 and ${max}.`] },
    ]);
  }
  return value;
}

export function parsePage(raw: string | null): number | undefined {
  if (raw === null || raw === "") return undefined;
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.validation([{ field: "page", issues: ["Must be a positive integer."] }]);
  }
  return Math.max(1, Number(raw));
}

export function parseStatus(raw: string | null): ArticleStatus | undefined {
  if (raw === null || raw === "") return undefined;
  if (!STATUSES.includes(raw as ArticleStatus)) {
    throw Errors.validation([
      { field: "status", issues: [`Must be one of: ${STATUSES.join(", ")}.`] },
    ]);
  }
  return raw as ArticleStatus;
}

export function parseBooleanParam(raw: string | null, field: string): boolean | undefined {
  if (raw === null || raw === "") return undefined;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw Errors.validation([{ field, issues: ["Must be \"true\" or \"false\"."] }]);
}

export function parseIdParam(raw: string | null, field: string): string | undefined {
  if (raw === null || raw === "") return undefined;
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.validation([{ field, issues: ["Must be a positive integer."] }]);
  }
  return raw;
}

export function parseCursor(raw: string | null): ArticleCursor | undefined {
  return decodeCursor(raw ?? undefined);
}

function parseOptionalNullableId(
  value: unknown,
  field: string,
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" && POSITIVE_INT.test(value)) return value;
  details.push({ field, issues: ["Must be a positive integer id or null."] });
  return undefined;
}

function parseOptionalBoolean(value: unknown, field: string, details: ErrorDetails): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  details.push({ field, issues: ["Must be a boolean."] });
  return undefined;
}

function parseOptionalDate(
  value: unknown,
  field: string,
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const time = Date.parse(value);
    if (!Number.isNaN(time)) return new Date(time).toISOString();
  }
  details.push({ field, issues: ["Must be an ISO 8601 date string or null."] });
  return undefined;
}

function parseOptionalStatus(
  value: unknown,
  details: ErrorDetails,
): ArticleStatus | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && STATUSES.includes(value as ArticleStatus)) {
    return value as ArticleStatus;
  }
  details.push({ field: "status", issues: [`Must be one of: ${STATUSES.join(", ")}.`] });
  return undefined;
}

function parseSlug(value: unknown, field: string, details: ErrorDetails): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    details.push({ field, issues: ["Must be a string."] });
    return undefined;
  }
  const slug = value.trim();
  if (
    slug.length < 1 ||
    slug.length > 200 ||
    !SLUG_PATTERN.test(slug) ||
    slug !== slug.toLowerCase()
  ) {
    details.push({
      field,
      issues: [
        "Must be 1-200 characters of letters and numbers joined by single hyphens, lowercase.",
      ],
    });
    return undefined;
  }
  return slug;
}

function parseLocalizedContent(
  value: unknown,
  locale: Locale,
  details: ErrorDetails,
  patch: boolean,
): LocalizedContentInput | undefined {
  if (value === undefined) return undefined;
  if (!isPlainObject(value)) {
    details.push({ field: `content.${locale}`, issues: ["Must be an object."] });
    return undefined;
  }

  const issues: string[] = [];
  const title = typeof value.title === "string" ? value.title.trim() : undefined;
  const summary = typeof value.summary === "string" ? value.summary.trim() : undefined;
  const body = typeof value.body === "string" ? value.body.trim() : undefined;

  if (title === undefined || title === "") issues.push("title is required and must not be empty.");
  else if (title.length > 500) issues.push("title must be 500 characters or fewer.");
  if (summary === undefined || summary === "") issues.push("summary is required and must not be empty.");
  if (body === undefined || body === "") issues.push("body is required and must not be empty.");

  let readTimeMinutes: number | null | undefined;
  if (value.readTimeMinutes === undefined) {
    readTimeMinutes = patch ? undefined : null;
  } else if (value.readTimeMinutes === null) {
    readTimeMinutes = null;
  } else if (
    typeof value.readTimeMinutes === "number" &&
    Number.isInteger(value.readTimeMinutes) &&
    value.readTimeMinutes >= 0
  ) {
    readTimeMinutes = value.readTimeMinutes;
  } else {
    issues.push("readTimeMinutes must be a non-negative integer or null.");
  }

  if (issues.length > 0) {
    details.push({ field: `content.${locale}`, issues });
    return undefined;
  }
  return {
    title: title as string,
    summary: summary as string,
    body: body as string,
    ...(readTimeMinutes !== undefined ? { readTimeMinutes } : {}),
  };
}

function parseTags(value: unknown, details: ErrorDetails): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    details.push({ field: "tags", issues: ["Must be an array of tag names."] });
    return undefined;
  }
  const issues: string[] = [];
  const tags: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || entry.trim() === "") {
      issues.push("Tag names must be non-empty strings.");
      break;
    }
    tags.push(entry.trim());
  }
  if (issues.length > 0) {
    details.push({ field: "tags", issues });
    return undefined;
  }
  return tags;
}

/** Reads and JSON-parses a request body into an unknown value. */
export async function readJsonBody(request: NextRequest): Promise<unknown> {
  const text = await request.text();
  if (text.trim() === "") {
    throw Errors.invalidJson("body is empty");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw Errors.invalidJson((error as Error).message);
  }
}

/** Validates a POST /api/articles body into a typed payload. */
export function parseCreateBody(value: unknown): CreateArticleInput {
  if (!isPlainObject(value)) {
    throw Errors.validation([{ field: "body", issues: ["Must be a JSON object."] }]);
  }
  const details: ErrorDetails = [];

  const slug = parseSlug(value.slug, "slug", details);
  if (!slug) details.push({ field: "slug", issues: ["slug is required."] });
  const category =
    typeof value.category === "string" && value.category.trim() !== ""
      ? value.category.trim()
      : undefined;
  if (!category) details.push({ field: "category", issues: ["category is required."] });

  const contents: Partial<Record<Locale, LocalizedContentInput>> = {};
  for (const locale of LOCALES) {
    if (!isPlainObject(value.content)) {
      details.push({ field: "content", issues: ["content is required."] });
      break;
    }
    const content = parseLocalizedContent(value.content[locale], locale, details, false);
    if (content) contents[locale] = content;
  }
  if (contents.bn === undefined) {
    details.push({ field: "content.bn", issues: ["content.bn is required."] });
  }
  if (contents.en === undefined) {
    details.push({ field: "content.en", issues: ["content.en is required."] });
  }

  const authorId = parseOptionalNullableId(value.authorId, "authorId", details);
  const featuredMediaId = parseOptionalNullableId(
    value.featuredMediaId,
    "featuredMediaId",
    details,
  );
  const status = parseOptionalStatus(value.status, details);
  const isFeatured = parseOptionalBoolean(value.isFeatured, "isFeatured", details);
  const isBreaking = parseOptionalBoolean(value.isBreaking, "isBreaking", details);
  const publishedAt = parseOptionalDate(value.publishedAt, "publishedAt", details);
  const tags = parseTags(value.tags, details);

  if (details.length > 0) throw Errors.validation(details);

  return {
    slug: slug as string,
    category: category as string,
    authorId,
    featuredMediaId,
    status,
    isFeatured,
    isBreaking,
    publishedAt,
    content: contents as Record<Locale, LocalizedContentInput>,
    tags,
  };
}

/** Validates a PATCH /api/articles/:id body into a typed payload. */
export function parseUpdateBody(value: unknown): UpdateArticleInput {
  if (!isPlainObject(value)) {
    throw Errors.validation([{ field: "body", issues: ["Must be a JSON object."] }]);
  }
  const details: ErrorDetails = [];
  const patch: UpdateArticleInput = {};

  if (value.slug !== undefined) {
    const slug = parseSlug(value.slug, "slug", details);
    if (slug) patch.slug = slug;
  }
  if (value.category !== undefined) {
    if (typeof value.category === "string" && value.category.trim() !== "") {
      patch.category = value.category.trim();
    } else {
      details.push({ field: "category", issues: ["Must be a non-empty string."] });
    }
  }
  const authorId = parseOptionalNullableId(value.authorId, "authorId", details);
  if (authorId !== undefined) patch.authorId = authorId;
  const featuredMediaId = parseOptionalNullableId(
    value.featuredMediaId,
    "featuredMediaId",
    details,
  );
  if (featuredMediaId !== undefined) patch.featuredMediaId = featuredMediaId;
  const status = parseOptionalStatus(value.status, details);
  if (status !== undefined) patch.status = status;
  const isFeatured = parseOptionalBoolean(value.isFeatured, "isFeatured", details);
  if (isFeatured !== undefined) patch.isFeatured = isFeatured;
  const isBreaking = parseOptionalBoolean(value.isBreaking, "isBreaking", details);
  if (isBreaking !== undefined) patch.isBreaking = isBreaking;
  const publishedAt = parseOptionalDate(value.publishedAt, "publishedAt", details);
  if (publishedAt !== undefined) patch.publishedAt = publishedAt;
  const tags = parseTags(value.tags, details);
  if (tags !== undefined) patch.tags = tags;

  if (value.content !== undefined) {
    if (!isPlainObject(value.content)) {
      details.push({ field: "content", issues: ["Must be an object."] });
    } else {
      const content: UpdateArticleInput["content"] = {};
      for (const locale of LOCALES) {
        const parsed = parseLocalizedContent(value.content[locale], locale, details, true);
        if (parsed) content[locale] = parsed;
      }
      patch.content = content;
    }
  }

  if (details.length > 0) throw Errors.validation(details);
  return patch;
}

/** Guards Path params for /api/articles/:id. */
export function parseArticleId(raw: string): string {
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.invalidId("id");
  }
  return raw;
}

/** Guards Path params for /api/articles/slug/:slug. */
export function parseSlugParam(raw: string): string {
  const slug = raw.trim().toLowerCase();
  if (slug.length < 1 || slug.length > 200 || !SLUG_PATTERN.test(slug)) {
    throw new ApiError(400, "INVALID_SLUG", "Path slug is invalid.");
  }
  return slug;
}