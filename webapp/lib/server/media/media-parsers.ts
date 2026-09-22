import type { NextRequest } from "next/server";
import { MEDIA_TYPES, type MediaType } from "../db/entities/enums";
import { Errors, type ErrorDetails } from "./media-errors";
import { DEFAULT_LIMIT, type CreateMediaInput, type UpdateMediaInput } from "./media-types";

const POSITIVE_INT = /^[1-9]\d*$/;
const FILENAME_MAX = 255;
const STORAGE_KEY_MAX = 255;
const MIME_MAX = 127;
const ALT_MAX = 300;
const INT4_MAX = 2147483647;
const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function parsePage(raw: string | null): number {
  if (raw === null || raw === "") return 1;
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.validation([{ field: "page", issues: ["Must be a positive integer."] }]);
  }
  return Math.max(1, Number(raw));
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

export function parseSearch(raw: string | null): string | undefined {
  const value = raw?.trim();
  return value ? value : undefined;
}

/** Admin type filter; follows the ads/live filter convention. */
export function parseTypeParam(raw: string | null): MediaType | undefined {
  if (raw === null || raw === "") return undefined;
  if (MEDIA_TYPES.includes(raw as MediaType)) return raw as MediaType;
  throw Errors.validation([
    { field: "type", issues: [`Must be one of: ${MEDIA_TYPES.join(", ")}.`] },
  ]);
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

function parseFilename(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw Errors.invalidFilename();
  const filename = value.trim();
  if (filename.length < 1 || filename.length > FILENAME_MAX) throw Errors.invalidFilename();
  return filename;
}

function parseUrl(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !isAbsoluteHttpUrl(value)) throw Errors.invalidUrl();
  return value.trim();
}

function parseType(value: unknown): MediaType | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && MEDIA_TYPES.includes(value as MediaType)) {
    return value as MediaType;
  }
  throw Errors.invalidType();
}

function parseOptionalShortText(
  value: unknown,
  field: "storageKey" | "mimeType",
  max: number,
  details: ErrorDetails,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" && value.trim().length <= max) return value.trim();
  details.push({ field, issues: [`Must be a string up to ${max} characters or null.`] });
  return undefined;
}

function parseSize(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_SAFE_INT
  ) {
    return value;
  }
  throw Errors.invalidSize();
}

function parseDimension(value: unknown, field: "width" | "height"): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= INT4_MAX
  ) {
    return value;
  }
  throw Errors.invalidDimensions(field);
}

function parseAlt(value: unknown, details: ErrorDetails): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const text = value.trim();
    if (text.length <= ALT_MAX) return text;
  }
  details.push({ field: "alt", issues: [`Must be a string up to ${ALT_MAX} characters or null.`] });
  return undefined;
}

interface ParsedMediaFields {
  filename?: string;
  url?: string;
  storageKey?: string | null;
  type?: MediaType;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

function parseMetadata(value: unknown, isCreate: boolean): ParsedMediaFields {
  if (!isPlainObject(value)) {
    throw Errors.validation([{ field: "body", issues: ["Must be a JSON object."] }]);
  }
  const details: ErrorDetails = [];
  const body: ParsedMediaFields = {};

  const filename = parseFilename(value.filename);
  if (filename !== undefined) body.filename = filename;
  if (isCreate && filename === undefined) {
    details.push({ field: "filename", issues: ["filename is required."] });
  }

  const url = parseUrl(value.url);
  if (url !== undefined) body.url = url;
  if (isCreate && url === undefined) {
    details.push({ field: "url", issues: ["url is required."] });
  }

  const type = parseType(value.type);
  if (type !== undefined) body.type = type;

  const storageKey = parseOptionalShortText(value.storageKey, "storageKey", STORAGE_KEY_MAX, details);
  if (storageKey !== undefined) body.storageKey = storageKey;

  const mimeType = parseOptionalShortText(value.mimeType, "mimeType", MIME_MAX, details);
  if (mimeType !== undefined) body.mimeType = mimeType;

  const size = parseSize(value.size);
  if (size !== undefined) body.size = size;

  const width = parseDimension(value.width, "width");
  if (width !== undefined) body.width = width;

  const height = parseDimension(value.height, "height");
  if (height !== undefined) body.height = height;

  const alt = parseAlt(value.alt, details);
  if (alt !== undefined) body.alt = alt;

  if (details.length > 0) throw Errors.validation(details);
  return body;
}

/** Validates a POST /api/media body into a typed payload. */
export function parseCreateBody(value: unknown): CreateMediaInput {
  return parseMetadata(value, true) as CreateMediaInput;
}

/** Validates a PATCH /api/media/:id body into a typed payload. */
export function parseUpdateBody(value: unknown): UpdateMediaInput {
  return parseMetadata(value, false) as UpdateMediaInput;
}

/** Guards Path params for /api/media/:id. */
export function parseMediaId(raw: string): string {
  if (!POSITIVE_INT.test(raw)) {
    throw Errors.invalidId("id");
  }
  return raw;
}