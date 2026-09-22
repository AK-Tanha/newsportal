import type { NextRequest } from "next/server";
import type { Locale, VideoStatus } from "../db/entities/enums";
import { Errors, type ErrorDetails } from "./video-errors";
import {
  DEFAULT_LIMIT,
  type CreateVideoInput,
  type UpdateVideoInput,
  type VideoCursor,
  decodeCursor,
} from "./video-types";

const STATUSES: VideoStatus[] = ["draft", "published"];
const LOCALES: Locale[] = ["bn", "en"];

const POSITIVE_INT = /^[1-9]\d*$/;
const SLUG_PATTERN = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const INT_MAX = 2147483647;

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

export function parseStatus(raw: string | null): VideoStatus | undefined {
  if (raw === null || raw === "") return undefined;
  if (!STATUSES.includes(raw as VideoStatus)) {
    throw Errors.validation([
      { field: "status", issues: [`Must be one of: ${STATUSES.join(", ")}.`] },
    ]);
  }
  return raw as VideoStatus;
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

export function parseCursor(raw: string | null): VideoCursor | undefined {
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
): VideoStatus | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && STATUSES.includes(value as VideoStatus)) {
    return value as VideoStatus;
  }
  details.push({ field: "status", issues: [`Must be one of: ${STATUSES.join(", ")}.`] });
  return undefined;
}

function parseOptionalInt(
  value: unknown,
  field: string,
  details: ErrorDetails,
): number | undefined {
  if (value === undefined) return undefined;
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= INT_MAX
  ) {
    return value;
  }
  details.push({ field, issues: [`Must be an integer between 0 and ${INT_MAX}.`] });
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

function parseVideoUrl(value: unknown, details: ErrorDetails): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    details.push({ field: "videoUrl", issues: ["Must be a string."] });
    return undefined;
  }
  const url = value.trim();
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    /* fall through to validation error */
  }
  details.push({ field: "videoUrl", issues: ["Must be an absolute http(s) URL."] });
  return undefined;
}

function parseLocalizedText(
  value: unknown,
  field: "title" | "summary",
  locale: Locale,
  details: ErrorDetails,
): string | undefined {
  const raw = isPlainObject(value)
    ? (value as Record<string, unknown>)[locale]
    : undefined;
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || raw.trim() === "") {
    details.push({
      field: `${field}.${locale}`,
      issues: ["Must be a non-empty string."],
    });
    return undefined;
  }
  return raw.trim();
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

function parseLocalizedPair(
  value: unknown,
  field: "title" | "summary",
  patch: boolean,
  details: ErrorDetails,
): Partial<Record<Locale, string>> | undefined {
  if (value === undefined) {
    // On create the localized object itself is required. Without this guard
    // the service would dereference `input.<field>.bn` and crash with a 500
    // instead of returning a validation error.
    if (!patch) {
      for (const locale of LOCALES) {
        details.push({
          field: `${field}.${locale}`,
          issues: [`${field}.${locale} is required.`],
        });
      }
    }
    return undefined;
  }
  if (!isPlainObject(value)) {
    details.push({ field, issues: ["Must be an object with bn and en fields."] });
    return undefined;
  }
  const result: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    const text = parseLocalizedText(value, field, locale, details);
    if (text !== undefined) result[locale] = text;
    if (!patch && text === undefined) {
      details.push({
        field: `${field}.${locale}`,
        issues: [`${field}.${locale} is required.`],
      });
    }
  }
  return result;
}

/** Validates a POST /api/videos body into a typed payload. */
export function parseCreateBody(value: unknown): CreateVideoInput {
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

  const title = parseLocalizedPair(value.title, "title", false, details);
  const summary = parseLocalizedPair(value.summary, "summary", false, details);

  const videoUrl = parseVideoUrl(value.videoUrl, details);
  if (value.videoUrl === undefined) {
    details.push({ field: "videoUrl", issues: ["videoUrl is required."] });
  }

  const authorId = parseOptionalNullableId(value.authorId, "authorId", details);
  const posterMediaId = parseOptionalNullableId(
    value.posterMediaId,
    "posterMediaId",
    details,
  );
  const durationSeconds = parseOptionalInt(value.durationSeconds, "durationSeconds", details);
  const viewsCount = parseOptionalInt(value.viewsCount, "viewsCount", details);
  const featured = parseOptionalBoolean(value.featured, "featured", details);
  const status = parseOptionalStatus(value.status, details);
  const publishedAt = parseOptionalDate(value.publishedAt, "publishedAt", details);

  if (details.length > 0) throw Errors.validation(details);

  return {
    slug: slug as string,
    category: category as string,
    authorId,
    posterMediaId,
    title: title as Record<Locale, string>,
    summary: summary as Record<Locale, string>,
    videoUrl: videoUrl as string,
    durationSeconds,
    viewsCount,
    featured,
    status,
    publishedAt,
  };
}

/** Validates a PATCH /api/videos/:id body into a typed payload. */
export function parseUpdateBody(value: unknown): UpdateVideoInput {
  if (!isPlainObject(value)) {
    throw Errors.validation([{ field: "body", issues: ["Must be a JSON object."] }]);
  }
  const details: ErrorDetails = [];
  const patch: UpdateVideoInput = {};

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
  const posterMediaId = parseOptionalNullableId(
    value.posterMediaId,
    "posterMediaId",
    details,
  );
  if (posterMediaId !== undefined) patch.posterMediaId = posterMediaId;
  const videoUrl = parseVideoUrl(value.videoUrl, details);
  if (videoUrl !== undefined) patch.videoUrl = videoUrl;
  const durationSeconds = parseOptionalInt(value.durationSeconds, "durationSeconds", details);
  if (durationSeconds !== undefined) patch.durationSeconds = durationSeconds;
  const viewsCount = parseOptionalInt(value.viewsCount, "viewsCount", details);
  if (viewsCount !== undefined) patch.viewsCount = viewsCount;
  const featured = parseOptionalBoolean(value.featured, "featured", details);
  if (featured !== undefined) patch.featured = featured;
  const status = parseOptionalStatus(value.status, details);
  if (status !== undefined) patch.status = status;
  const publishedAt = parseOptionalDate(value.publishedAt, "publishedAt", details);
  if (publishedAt !== undefined) patch.publishedAt = publishedAt;

  const title = parseLocalizedPair(value.title, "title", true, details);
  if (title) patch.title = title;
  const summary = parseLocalizedPair(value.summary, "summary", true, details);
  if (summary) patch.summary = summary;

  if (details.length > 0) throw Errors.validation(details);
  return patch;
}

/** Guards Path params for /api/videos/:id. */
export function parseVideoId(raw: string): string {
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.invalidId("id");
  }
  return raw;
}

/** Guards Path params for /api/videos/slug/:slug. */
export function parseSlugParam(raw: string): string {
  const slug = raw.trim().toLowerCase();
  if (slug.length < 1 || slug.length > 200 || !SLUG_PATTERN.test(slug)) {
    throw Errors.invalidSlug();
  }
  return slug;
}