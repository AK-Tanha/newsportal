import type { NextRequest } from "next/server";
import type { LiveStatus, Locale } from "../db/entities/enums";
import { Errors, type ErrorDetails } from "./live-errors";
import {
  DEFAULT_LIMIT,
  type CreateLiveInput,
  type UpdateLiveInput,
} from "./live-types";

const STATUSES: LiveStatus[] = ["live", "offline"];
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

export function parseStatus(raw: string | null): LiveStatus | undefined {
  if (raw === null || raw === "") return undefined;
  if (!STATUSES.includes(raw as LiveStatus)) {
    throw Errors.validation([
      { field: "status", issues: [`Must be one of: ${STATUSES.join(", ")}.`] },
    ]);
  }
  return raw as LiveStatus;
}

export function parseBooleanParam(raw: string | null, field: string): boolean | undefined {
  if (raw === null || raw === "") return undefined;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw Errors.validation([{ field, issues: ["Must be \"true\" or \"false\"."] }]);
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
): LiveStatus | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && STATUSES.includes(value as LiveStatus)) {
    return value as LiveStatus;
  }
  details.push({
    field: "status",
    issues: [`Must be one of: ${STATUSES.join(", ")} and the active state must agree.`],
  });
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

function parseOptionalNullableUrl(
  value: unknown,
  field: string,
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    details.push({ field, issues: ["Must be an absolute http(s) URL or null."] });
    return undefined;
  }
  const url = value.trim();
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    /* fall through to validation error */
  }
  details.push({ field, issues: ["Must be an absolute http(s) URL or null."] });
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

function parseLocalizedText(
  value: unknown,
  field: "title" | "description",
  locale: Locale,
  details: ErrorDetails,
): string | undefined {
  const raw = isPlainObject(value)
    ? (value as Record<string, unknown>)[locale]
    : undefined;
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || raw.trim() === "") {
    details.push({ field: `${field}.${locale}`, issues: ["Must be a non-empty string."] });
    return undefined;
  }
  return raw.trim();
}

function parseLocalizedPair(
  value: unknown,
  field: "title" | "description",
  patch: boolean,
  details: ErrorDetails,
): Partial<Record<Locale, string>> | undefined {
  if (value === undefined) return undefined;
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

/** Validates a POST /api/live body into a typed payload. */
export function parseCreateBody(value: unknown): CreateLiveInput {
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
  const description = parseLocalizedPair(value.description, "description", false, details);

  const posterMediaId = parseOptionalNullableId(value.posterMediaId, "posterMediaId", details);
  const streamUrl = parseOptionalNullableUrl(value.streamUrl, "streamUrl", details);
  const status = parseOptionalStatus(value.status, details);
  const active = parseOptionalBoolean(value.active, "active", details);
  const startedAt = parseOptionalDate(value.startedAt, "startedAt", details);
  const viewerCount = parseOptionalInt(value.viewerCount, "viewerCount", details);

  if (status === "live" && active === false) {
    details.push({
      field: "active",
      issues: ["active cannot be false when status is live."],
    });
  }
  if (status === "offline" && active === true) {
    details.push({
      field: "active",
      issues: ["active cannot be true when status is offline."],
    });
  }

  if (details.length > 0) throw Errors.validation(details);

  return {
    slug: slug as string,
    category: category as string,
    posterMediaId,
    title: title as Record<Locale, string>,
    description: description as Record<Locale, string>,
    streamUrl,
    status,
    active,
    startedAt,
    viewerCount,
  };
}

/** Validates a PATCH /api/live/:id body into a typed payload. */
export function parseUpdateBody(value: unknown): UpdateLiveInput {
  if (!isPlainObject(value)) {
    throw Errors.validation([{ field: "body", issues: ["Must be a JSON object."] }]);
  }
  const details: ErrorDetails = [];
  const patch: UpdateLiveInput = {};

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
  const posterMediaId = parseOptionalNullableId(value.posterMediaId, "posterMediaId", details);
  if (posterMediaId !== undefined) patch.posterMediaId = posterMediaId;
  const streamUrl = parseOptionalNullableUrl(value.streamUrl, "streamUrl", details);
  if (streamUrl !== undefined) patch.streamUrl = streamUrl;
  const status = parseOptionalStatus(value.status, details);
  if (status !== undefined) patch.status = status;
  const active = parseOptionalBoolean(value.active, "active", details);
  if (active !== undefined) patch.active = active;
  const startedAt = parseOptionalDate(value.startedAt, "startedAt", details);
  if (startedAt !== undefined) patch.startedAt = startedAt;
  const viewerCount = parseOptionalInt(value.viewerCount, "viewerCount", details);
  if (viewerCount !== undefined) patch.viewerCount = viewerCount;

  const title = parseLocalizedPair(value.title, "title", true, details);
  if (title) patch.title = title;
  const description = parseLocalizedPair(value.description, "description", true, details);
  if (description) patch.description = description;

  if (details.length > 0) throw Errors.validation(details);
  return patch;
}

/** Guards Path params for /api/live/:id. */
export function parseLiveId(raw: string): string {
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.invalidId("id");
  }
  return raw;
}