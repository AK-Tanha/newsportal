import type { AdPlacement, AdType, Locale } from "../db/entities/enums";
import type { AdDetailDto, AdImageDto, AdListItemDto } from "./ads-types";
import type { AdRow } from "./ads-repository";

type RowWithMediaId = AdRow & { imageMediaId?: string | null };

function toBool(value: unknown): boolean {
  return value === true || value === "true";
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

/** Pick the requested locale, falling back to the other when it is empty. */
function pickLocalized(
  bn: string | null,
  en: string | null,
  locale: Locale,
): string | null {
  if (locale === "bn") return bn || en;
  return en || bn;
}

function dateOnly(value: string | Date | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

function iso(value: Date | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function image(row: AdRow): AdImageDto | null {
  if (row.imageUrl === null) return null;
  const width = row.imageWidth === null ? null : Number(row.imageWidth);
  const height = row.imageHeight === null ? null : Number(row.imageHeight);
  return {
    url: row.imageUrl,
    alt: stringOrNull(row.imageAlt),
    width,
    height,
  };
}

/**
 * Maps an ad row to its public/admin DTO. `placements` come from the grouped
 * placement fetch performed once per listing/detail call.
 */
export function toListItem(
  row: AdRow,
  locale: Locale,
  placements: AdPlacement[],
  options: { admin?: boolean } = {},
): AdListItemDto {
  const item: AdListItemDto = {
    id: row.id,
    slug: row.slug,
    type: row.type as AdType,
    name: pickLocalized(row.titleBn, row.titleEn, locale) ?? "",
    description: pickLocalized(row.descriptionBn, row.descriptionEn, locale),
    image: image(row),
    targetUrl: row.targetUrl,
    alt: stringOrNull(row.alt),
    placements,
  };
  if (options.admin) {
    item.active = toBool(row.isActive);
    item.startDate = dateOnly(row.startDate);
    item.endDate = dateOnly(row.endDate);
    item.createdAt = iso(row.createdAt) ?? undefined;
    item.updatedAt = iso(row.updatedAt) ?? undefined;
  }
  return item;
}

/** Maps an ad detail (row + image media + placements) to its DTO. */
export function toDetail(
  raw: RowWithMediaId,
  locale: Locale,
  placements: AdPlacement[],
): AdDetailDto {
  const base = toListItem(raw, locale, placements, { admin: true });
  return {
    ...base,
    active: toBool(raw.isActive),
    startDate: dateOnly(raw.startDate),
    endDate: dateOnly(raw.endDate),
    createdAt: iso(raw.createdAt) ?? "",
    updatedAt: iso(raw.updatedAt) ?? "",
    imageMediaId: raw.imageMediaId ?? null,
    localized: {
      bn: { name: raw.titleBn, description: stringOrNull(raw.descriptionBn) },
      en: { name: raw.titleEn, description: stringOrNull(raw.descriptionEn) },
    },
  };
}