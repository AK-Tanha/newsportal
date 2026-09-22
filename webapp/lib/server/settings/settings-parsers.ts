import type { NextRequest } from "next/server";
import { Errors, type ErrorDetails } from "./settings-errors";
import type { UpdateSettingsInput } from "./settings-types";

const SLUG_PATTERN = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

const MAX_LENGTH: Record<string, number> = {
  siteNameBn: 200,
  siteNameEn: 200,
  taglineBn: 300,
  taglineEn: 300,
  editorNameBn: 200,
  editorNameEn: 200,
  metaTitleBn: 300,
  metaTitleEn: 300,
  newsletterEmail: 255,
  defaultLiveSlug: 200,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Absolute http(s) URL or a root-relative path (e.g. "/logo.png"). */
function isUrlOrPath(value: string): boolean {
  if (value.startsWith("/")) return true;
  return isAbsoluteHttpUrl(value);
}

/**
 * Required text field: non-empty trimmed string within the schema length.
 * Returns undefined on validation failure (error is pushed to `details`).
 */
function parseRequiredText(
  value: unknown,
  field: string,
  details: ErrorDetails,
): string | undefined {
  if (typeof value !== "string") {
    details.push({ field, issues: ["Must be a non-empty string."] });
    return undefined;
  }
  const text = value.trim();
  if (text === "") {
    details.push({ field, issues: ["Must not be empty."] });
    return undefined;
  }
  const max = MAX_LENGTH[field];
  if (max !== undefined && text.length > max) {
    details.push({ field, issues: [`Must be ${max} characters or fewer.`] });
    return undefined;
  }
  return text;
}

/**
 * Nullable text field. `null` and `""` both clear the value (stored as NULL).
 * A provided non-empty value is trimmed and length-checked.
 */
function parseNullableText(
  value: unknown,
  field: string,
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    details.push({ field, issues: ["Must be a string or null."] });
    return undefined;
  }
  const text = value.trim();
  if (text === "") return null;
  const max = MAX_LENGTH[field];
  if (max !== undefined && text.length > max) {
    details.push({ field, issues: [`Must be ${max} characters or fewer.`] });
    return undefined;
  }
  return text;
}

/** Required non-nullable URL or root-relative path field. */
function parseRequiredUrlOrPath(
  value: unknown,
  field: string,
  details: ErrorDetails,
): string | undefined {
  const text = parseRequiredText(value, field, details);
  if (text === undefined) return undefined;
  if (!isUrlOrPath(text)) {
    details.push({
      field,
      issues: ["Must be an absolute http(s) URL or a root-relative path."],
    });
    return undefined;
  }
  return text;
}

/** Nullable absolute http(s) URL field (social links, metadata base URL). */
function parseNullableHttpUrl(
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
  if (url === "") return null;
  if (!isAbsoluteHttpUrl(url)) {
    details.push({
      field,
      issues: ["Must be an absolute http(s) URL or null."],
    });
    return undefined;
  }
  return url;
}

/** Nullable URL-or-root-relative-path field (Open Graph image). */
function parseNullableUrlOrPath(
  value: unknown,
  field: string,
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    details.push({
      field,
      issues: ["Must be an absolute http(s) URL, a root-relative path, or null."],
    });
    return undefined;
  }
  const text = value.trim();
  if (text === "") return null;
  if (!isUrlOrPath(text)) {
    details.push({
      field,
      issues: ["Must be an absolute http(s) URL, a root-relative path, or null."],
    });
    return undefined;
  }
  return text;
}

/** Whole-number count bounded to [min, max] (mirrors the admin form rules). */
function parseCount(
  value: unknown,
  field: string,
  min: number,
  max: number,
  details: ErrorDetails,
): number | undefined {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  ) {
    return value;
  }
  details.push({ field, issues: [`Must be a whole number between ${min} and ${max}.`] });
  return undefined;
}

/**
 * Nullable live-stream slug. `null`/`""` clear it. Non-empty values are
 * shape-checked here; existence in the live_streams table is verified by the
 * service inside the update transaction.
 */
function parseNullableSlug(
  value: unknown,
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    details.push({ field: "defaultLiveSlug", issues: ["Must be a string or null."] });
    return undefined;
  }
  const slug = value.trim();
  if (slug === "") return null;
  const max = MAX_LENGTH.defaultLiveSlug;
  if (slug.length > max || !SLUG_PATTERN.test(slug)) {
    details.push({
      field: "defaultLiveSlug",
      issues: [`Must be ${max} characters of letters and numbers joined by single hyphens, or null.`],
    });
    return undefined;
  }
  return slug;
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

/**
 * Validates a PATCH /api/settings body into a typed partial payload.
 *
 * Unknown and forbidden keys (id, createdAt, updatedAt, updatedBy…) are
 * ignored, consistent with the existing resource parsers, which only read
 * known keys. Nullable fields accept `null` (or `""`) to clear the value.
 * Empty patch objects are allowed and are a no-op.
 */
export function parseUpdateBody(value: unknown): UpdateSettingsInput {
  if (!isPlainObject(value)) {
    throw Errors.validation([{ field: "body", issues: ["Must be a JSON object."] }]);
  }
  const details: ErrorDetails = [];
  const patch: UpdateSettingsInput = {};

  if (value.siteNameBn !== undefined) {
    const parsed = parseRequiredText(value.siteNameBn, "siteNameBn", details);
    if (parsed !== undefined) patch.siteNameBn = parsed;
  }
  if (value.siteNameEn !== undefined) {
    const parsed = parseRequiredText(value.siteNameEn, "siteNameEn", details);
    if (parsed !== undefined) patch.siteNameEn = parsed;
  }
  if (value.taglineBn !== undefined) {
    const parsed = parseRequiredText(value.taglineBn, "taglineBn", details);
    if (parsed !== undefined) patch.taglineBn = parsed;
  }
  if (value.taglineEn !== undefined) {
    const parsed = parseRequiredText(value.taglineEn, "taglineEn", details);
    if (parsed !== undefined) patch.taglineEn = parsed;
  }
  if (value.logoUrl !== undefined) {
    const parsed = parseRequiredUrlOrPath(value.logoUrl, "logoUrl", details);
    if (parsed !== undefined) patch.logoUrl = parsed;
  }
  if (value.faviconUrl !== undefined) {
    const parsed = parseRequiredUrlOrPath(value.faviconUrl, "faviconUrl", details);
    if (parsed !== undefined) patch.faviconUrl = parsed;
  }
  if (value.newsletterEmail !== undefined) {
    const parsed = parseNullableText(value.newsletterEmail, "newsletterEmail", details);
    if (parsed !== undefined) {
      if (parsed !== null && !isValidEmail(parsed)) {
        details.push({
          field: "newsletterEmail",
          issues: ["Must be a valid email address or null."],
        });
      } else {
        patch.newsletterEmail = parsed;
      }
    }
  }
  if (value.editorNameBn !== undefined) {
    const parsed = parseRequiredText(value.editorNameBn, "editorNameBn", details);
    if (parsed !== undefined) patch.editorNameBn = parsed;
  }
  if (value.editorNameEn !== undefined) {
    const parsed = parseRequiredText(value.editorNameEn, "editorNameEn", details);
    if (parsed !== undefined) patch.editorNameEn = parsed;
  }

  const social: Array<
    | "facebookUrl"
    | "twitterUrl"
    | "instagramUrl"
    | "youtubeUrl"
  > = [
    "facebookUrl",
    "twitterUrl",
    "instagramUrl",
    "youtubeUrl",
  ];
  for (const field of social) {
    if (value[field] !== undefined) {
      const parsed = parseNullableHttpUrl(value[field] as unknown, field, details);
      if (parsed !== undefined) patch[field] = parsed;
    }
  }

  if (value.latestArticlesCount !== undefined) {
    const parsed = parseCount(value.latestArticlesCount, "latestArticlesCount", 1, 50, details);
    if (parsed !== undefined) patch.latestArticlesCount = parsed;
  }
  if (value.mostReadCount !== undefined) {
    const parsed = parseCount(value.mostReadCount, "mostReadCount", 1, 20, details);
    if (parsed !== undefined) patch.mostReadCount = parsed;
  }
  if (value.breakingMaxItems !== undefined) {
    const parsed = parseCount(value.breakingMaxItems, "breakingMaxItems", 1, 20, details);
    if (parsed !== undefined) patch.breakingMaxItems = parsed;
  }

  if (value.defaultLiveSlug !== undefined) {
    const parsed = parseNullableSlug(value.defaultLiveSlug, details);
    if (parsed !== undefined) patch.defaultLiveSlug = parsed;
  }

  if (value.metaTitleBn !== undefined) {
    const parsed = parseRequiredText(value.metaTitleBn, "metaTitleBn", details);
    if (parsed !== undefined) patch.metaTitleBn = parsed;
  }
  if (value.metaTitleEn !== undefined) {
    const parsed = parseRequiredText(value.metaTitleEn, "metaTitleEn", details);
    if (parsed !== undefined) patch.metaTitleEn = parsed;
  }
  if (value.metaDescriptionBn !== undefined) {
    const parsed = parseRequiredText(value.metaDescriptionBn, "metaDescriptionBn", details);
    if (parsed !== undefined) patch.metaDescriptionBn = parsed;
  }
  if (value.metaDescriptionEn !== undefined) {
    const parsed = parseRequiredText(value.metaDescriptionEn, "metaDescriptionEn", details);
    if (parsed !== undefined) patch.metaDescriptionEn = parsed;
  }
  if (value.ogImageUrl !== undefined) {
    const parsed = parseNullableUrlOrPath(value.ogImageUrl, "ogImageUrl", details);
    if (parsed !== undefined) patch.ogImageUrl = parsed;
  }
  if (value.metadataBaseUrl !== undefined) {
    const parsed = parseNullableHttpUrl(value.metadataBaseUrl, "metadataBaseUrl", details);
    if (parsed !== undefined) patch.metadataBaseUrl = parsed;
  }

  if (details.length > 0) throw Errors.validation(details);
  return patch;
}