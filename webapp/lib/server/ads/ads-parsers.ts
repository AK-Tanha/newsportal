import type { NextRequest } from "next/server";
import { AD_PLACEMENTS, AD_TYPES, type AdPlacement, type AdType, type Locale } from "../db/entities/enums";
import { Errors, type ErrorDetails } from "./ads-errors";
import { DEFAULT_LIMIT, type CreateAdInput, type UpdateAdInput } from "./ads-types";

const POSITIVE_INT = /^[1-9]\d*$/;
const SLUG_PATTERN = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NAME_MAX = 300;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isoDateOnly(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
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

export function parseSearch(raw: string | null): string | undefined {
  const value = raw?.trim();
  return value ? value : undefined;
}

/** Parses the public/admin placement query filter into an enum value. */
export function parsePlacementParam(raw: string | null): AdPlacement | undefined {
  if (raw === null || raw === "") return undefined;
  if (AD_PLACEMENTS.includes(raw as AdPlacement)) return raw as AdPlacement;
  throw Errors.invalidPlacement(raw);
}

/** Parses the admin type filter; follows the live-module convention for filters. */
export function parseTypeParam(raw: string | null): AdType | undefined {
  if (raw === null || raw === "") return undefined;
  if (AD_TYPES.includes(raw as AdType)) return raw as AdType;
  throw Errors.validation([
    { field: "type", issues: [`Must be one of: ${AD_TYPES.join(", ")}.`] },
  ]);
}

export function parseBooleanParam(raw: string | null, field: string): boolean | undefined {
  if (raw === null || raw === "") return undefined;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw Errors.validation([{ field, issues: ["Must be \"true\" or \"false\"."] }]);
}

/** Parses an admin date filter (YYYY-MM-DD or any parseable date). */
export function parseDateParam(raw: string | null, field: string): string | undefined {
  if (raw === null || raw === "") return undefined;
  if (typeof raw !== "string" || Number.isNaN(Date.parse(raw))) {
    throw Errors.validation([{ field, issues: ["Must be an ISO 8601 date string."] }]);
  }
  return isoDateOnly(raw);
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

function normalizeLocalizedText(
  value: unknown,
  field: "name" | "description",
  locale: Locale,
  required: boolean,
  details: ErrorDetails,
): string | null | undefined {
  const raw = isPlainObject(value) ? (value as Record<string, unknown>)[locale] : undefined;
  if (raw === undefined) {
    if (required) {
      details.push({ field: `${field}.${locale}`, issues: [`${field}.${locale} is required.`] });
    }
    return undefined;
  }
  if (raw === null) return null;
  if (typeof raw !== "string" || raw.trim() === "") {
    details.push({ field: `${field}.${locale}`, issues: ["Must be a non-empty string."] });
    return undefined;
  }
  const text = raw.trim();
  if (field === "name" && text.length > NAME_MAX) {
    details.push({ field: `${field}.${locale}`, issues: [`Must be at most ${NAME_MAX} characters.`] });
    return undefined;
  }
  return text;
}

function parseNamePair(
  value: unknown,
  patch: boolean,
  details: ErrorDetails,
): Partial<Record<Locale, string>> | undefined {
  if (value === undefined) return undefined;
  if (!isPlainObject(value)) {
    details.push({ field: "name", issues: ["Must be an object with bn and en fields."] });
    return undefined;
  }
  const result: Partial<Record<Locale, string>> = {};
  for (const locale of ["bn", "en"] as Locale[]) {
    const text = normalizeLocalizedText(value, "name", locale, !patch, details);
    if (text !== undefined && text !== null) result[locale] = text;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function parseDescriptionPair(
  value: unknown,
  details: ErrorDetails,
): Partial<Record<Locale, string | null>> | undefined {
  if (value === undefined) return undefined;
  if (!isPlainObject(value)) {
    details.push({ field: "description", issues: ["Must be an object with bn and en fields."] });
    return undefined;
  }
  const result: Partial<Record<Locale, string | null>> = {};
  for (const locale of ["bn", "en"] as Locale[]) {
    const text = normalizeLocalizedText(value, "description", locale, false, details);
    if (text !== undefined) result[locale] = text;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function parseType(value: unknown): AdType | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && AD_TYPES.includes(value as AdType)) {
    return value as AdType;
  }
  throw Errors.invalidType();
}

function parseImageMediaId(
  value: unknown,
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" && POSITIVE_INT.test(value)) return value;
  details.push({ field: "imageMediaId", issues: ["Must be a positive integer media id or null."] });
  return undefined;
}

function parseTargetUrl(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !isAbsoluteHttpUrl(value)) {
    throw Errors.invalidUrl("targetUrl");
  }
  return value.trim();
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseAlt(value: unknown, details: ErrorDetails): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const text = value.trim();
    if (text.length <= 300) return text;
  }
  details.push({ field: "alt", issues: ["Must be a string up to 300 characters or null."] });
  return undefined;
}

function parseActive(value: unknown, details: ErrorDetails): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  details.push({ field: "active", issues: ["Must be a boolean."] });
  return undefined;
}

function parseOptionalDate(
  value: unknown,
  field: "startDate" | "endDate",
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    const date = isoDateOnly(value);
    if (DATE_PATTERN.test(date)) return date;
  }
  details.push({ field, issues: ["Must be an ISO 8601 date string (YYYY-MM-DD) or null."] });
  return undefined;
}

function parsePlacements(value: unknown): AdPlacement[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw Errors.invalidPlacement("placements");
  }
  const seen = new Set<AdPlacement>();
  const result: AdPlacement[] = [];
  for (const entry of value as unknown[]) {
    if (!AD_PLACEMENTS.includes(entry as AdPlacement)) {
      throw Errors.invalidPlacement(String(entry));
    }
    const placement = entry as AdPlacement;
    if (!seen.has(placement)) {
      seen.add(placement);
      result.push(placement);
    }
  }
  return result;
}

function requireAtLeastOnePlacement(
  placements: AdPlacement[] | undefined,
  details: ErrorDetails,
): void {
  if (placements === undefined || placements.length === 0) {
    details.push({ field: "placements", issues: ["At least one placement is required."] });
  }
}

/** Validates a POST /api/ads body into a typed payload. */
export function parseCreateBody(value: unknown): CreateAdInput {
  if (!isPlainObject(value)) {
    throw Errors.validation([{ field: "body", issues: ["Must be a JSON object."] }]);
  }
  const details: ErrorDetails = [];

  const slug = parseSlug(value.slug, "slug", details);
  if (!slug) details.push({ field: "slug", issues: ["slug is required."] });
  const name = parseNamePair(value.name, false, details);
  const description = parseDescriptionPair(value.description, details);
  const type = parseType(value.type);
  const imageMediaId = parseImageMediaId(value.imageMediaId, details);
  const targetUrl = parseTargetUrl(value.targetUrl);
  const alt = parseAlt(value.alt, details);
  const active = parseActive(value.active, details);
  const startDate = parseOptionalDate(value.startDate, "startDate", details);
  const endDate = parseOptionalDate(value.endDate, "endDate", details);
  const placements = parsePlacements(value.placements);
  requireAtLeastOnePlacement(placements, details);

  if (targetUrl === undefined) details.push({ field: "targetUrl", issues: ["targetUrl is required."] });

  if (details.length > 0) throw Errors.validation(details);

  return {
    slug: slug as string,
    type,
    name: {
      bn: name?.bn ?? "",
      en: name?.en ?? "",
    } as Record<Locale, string>,
    description,
    imageMediaId,
    targetUrl: targetUrl as string,
    alt,
    active,
    startDate,
    endDate,
    placements: placements as AdPlacement[],
  };
}

/** Validates a PATCH /api/ads/:id body into a typed payload. */
export function parseUpdateBody(value: unknown): UpdateAdInput {
  if (!isPlainObject(value)) {
    throw Errors.validation([{ field: "body", issues: ["Must be a JSON object."] }]);
  }
  const details: ErrorDetails = [];
  const patch: UpdateAdInput = {};

  if (value.slug !== undefined) {
    const slug = parseSlug(value.slug, "slug", details);
    if (slug) patch.slug = slug;
  }
  const type = parseType(value.type);
  if (type !== undefined) patch.type = type;
  const imageMediaId = parseImageMediaId(value.imageMediaId, details);
  if (imageMediaId !== undefined) patch.imageMediaId = imageMediaId;
  const targetUrl = parseTargetUrl(value.targetUrl);
  if (targetUrl !== undefined) patch.targetUrl = targetUrl;
  const alt = parseAlt(value.alt, details);
  if (alt !== undefined) patch.alt = alt;
  const active = parseActive(value.active, details);
  if (active !== undefined) patch.active = active;
  const startDate = parseOptionalDate(value.startDate, "startDate", details);
  if (startDate !== undefined) patch.startDate = startDate;
  const endDate = parseOptionalDate(value.endDate, "endDate", details);
  if (endDate !== undefined) patch.endDate = endDate;
  const placements = parsePlacements(value.placements);
  if (placements !== undefined) patch.placements = placements;

  const name = parseNamePair(value.name, true, details);
  if (name) patch.name = name;
  const description = parseDescriptionPair(value.description, details);
  if (description) patch.description = description;

  if (details.length > 0) throw Errors.validation(details);
  return patch;
}

/** Guards Path params for /api/ads/:id. */
export function parseAdId(raw: string): string {
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.invalidId("id");
  }
  return raw;
}