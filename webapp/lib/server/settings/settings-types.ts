import type { SiteSettings } from "../db/entities/site-settings";

export const SETTINGS_ID = 1;

/**
 * The settings record is a singleton: the `site_settings` table is locked to
 * a single row via `ck_site_settings_single_row CHECK (id = 1)`. Every read
 * and write operates on id = 1, and no other id is ever accepted.
 */
export const SETTINGS_SINGLETON_NOTE =
  "site_settings holds exactly one row (id = 1) enforced by the check constraint ck_site_settings_single_row.";

/**
 * Every field an operator can edit, in the wire shape exposed by the API.
 *
 * This is the admin/management projection: all editable columns plus the
 * management `updatedAt` timestamp. Nothing in the table is secret today —
 * there are no credentials or tokens — so the projection is intentionally
 * complete. If a future public endpoint needs a narrower shape, project a
 * subset of these same fields; the repository already returns the row once.
 */
export interface SettingsDto {
  siteNameBn: string;
  siteNameEn: string;
  taglineBn: string;
  taglineEn: string;
  logoUrl: string;
  faviconUrl: string;
  newsletterEmail: string | null;
  editorNameBn: string;
  editorNameEn: string;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  latestArticlesCount: number;
  mostReadCount: number;
  breakingMaxItems: number;
  defaultLiveSlug: string | null;
  metaTitleBn: string;
  metaTitleEn: string;
  metaDescriptionBn: string;
  metaDescriptionEn: string;
  ogImageUrl: string | null;
  metadataBaseUrl: string | null;
  updatedAt: string;
}

/**
 * Partial-patch payload for PATCH /api/settings. Every field is optional;
 * omitted fields keep their current value. Nullable columns accept `null`
 * (and `""`) to clear the value. `id`, `createdAt`, `updatedAt` and
 * `updatedBy` are never accepted — the parser ignores unknown and forbidden
 * keys, so they can never be written.
 */
export interface UpdateSettingsInput {
  siteNameBn?: string;
  siteNameEn?: string;
  taglineBn?: string;
  taglineEn?: string;
  logoUrl?: string;
  faviconUrl?: string;
  newsletterEmail?: string | null;
  editorNameBn?: string;
  editorNameEn?: string;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  latestArticlesCount?: number;
  mostReadCount?: number;
  breakingMaxItems?: number;
  defaultLiveSlug?: string | null;
  metaTitleBn?: string;
  metaTitleEn?: string;
  metaDescriptionBn?: string;
  metaDescriptionEn?: string;
  ogImageUrl?: string | null;
  metadataBaseUrl?: string | null;
}

/**
 * The updatable columns mapped to `SiteSettings` property names for
 * `EntityManager.update`. Never includes id or createdAt — those are managed
 * by the service. updatedById is stamped from the authenticated admin session
 * (never accepted from clients) and updatedAt is set server-side.
 */
export type SettingsUpdateValues = Partial<
  Pick<
    SiteSettings,
    | "siteNameBn"
    | "siteNameEn"
    | "taglineBn"
    | "taglineEn"
    | "logoUrl"
    | "faviconUrl"
    | "newsletterEmail"
    | "editorNameBn"
    | "editorNameEn"
    | "facebookUrl"
    | "twitterUrl"
    | "instagramUrl"
    | "youtubeUrl"
    | "latestArticlesCount"
    | "mostReadCount"
    | "breakingMaxItems"
    | "defaultLiveSlug"
    | "metaTitleBn"
    | "metaTitleEn"
    | "metaDescriptionBn"
    | "metaDescriptionEn"
    | "ogImageUrl"
    | "metadataBaseUrl"
    | "updatedById"
    | "updatedAt"
  >
>;