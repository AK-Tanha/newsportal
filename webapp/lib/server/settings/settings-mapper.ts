import type { SettingsRow } from "./settings-repository";
import type { SettingsDto } from "./settings-types";

function iso(value: Date): string {
  return Number.isNaN(value.getTime()) ? new Date(0).toISOString() : value.toISOString();
}

/**
 * Maps the singleton settings row to the wire DTO.
 *
 * The projection is explicit: only the editable configuration fields plus the
 * management `updatedAt` timestamp are surfaced. The internal `id`,
 * `created_at` and `updated_by` columns are deliberately not exposed — the
 * row's id is always the fixed singleton id 1 and `updated_by` is a user
 * reference that will be served (and stamped) once attribution lands.
 */
export function toSettingsDto(row: SettingsRow): SettingsDto {
  return {
    siteNameBn: row.siteNameBn,
    siteNameEn: row.siteNameEn,
    taglineBn: row.taglineBn,
    taglineEn: row.taglineEn,
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,
    newsletterEmail: row.newsletterEmail ?? null,
    editorNameBn: row.editorNameBn,
    editorNameEn: row.editorNameEn,
    facebookUrl: row.facebookUrl ?? null,
    twitterUrl: row.twitterUrl ?? null,
    instagramUrl: row.instagramUrl ?? null,
    youtubeUrl: row.youtubeUrl ?? null,
    latestArticlesCount: row.latestArticlesCount,
    mostReadCount: row.mostReadCount,
    breakingMaxItems: row.breakingMaxItems,
    defaultLiveSlug: row.defaultLiveSlug ?? null,
    metaTitleBn: row.metaTitleBn,
    metaTitleEn: row.metaTitleEn,
    metaDescriptionBn: row.metaDescriptionBn,
    metaDescriptionEn: row.metaDescriptionEn,
    ogImageUrl: row.ogImageUrl ?? null,
    metadataBaseUrl: row.metadataBaseUrl ?? null,
    updatedAt: iso(row.updatedAt),
  };
}