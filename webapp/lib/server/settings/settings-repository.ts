import type { EntityManager } from "typeorm";
import { LiveStream } from "../db/entities/live-stream";
import { SiteSettings } from "../db/entities/site-settings";
import { SETTINGS_ID, type SettingsUpdateValues } from "./settings-types";

/**
 * Explicit projection of the singleton settings row. `id` is always the fixed
 * singleton id 1, and `updatedById` is included only because the update flow
 * must leave it untouched — it is never surfaced by the DTO mapper.
 */
export interface SettingsRow {
  id: number;
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
  updatedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const SELECT: Array<[string, string]> = [
  ["s.id", "id"],
  ["s.site_name_bn", "siteNameBn"],
  ["s.site_name_en", "siteNameEn"],
  ["s.tagline_bn", "taglineBn"],
  ["s.tagline_en", "taglineEn"],
  ["s.logo_url", "logoUrl"],
  ["s.favicon_url", "faviconUrl"],
  ["s.newsletter_email", "newsletterEmail"],
  ["s.editor_name_bn", "editorNameBn"],
  ["s.editor_name_en", "editorNameEn"],
  ["s.facebook_url", "facebookUrl"],
  ["s.twitter_url", "twitterUrl"],
  ["s.instagram_url", "instagramUrl"],
  ["s.youtube_url", "youtubeUrl"],
  ["s.latest_articles_count", "latestArticlesCount"],
  ["s.most_read_count", "mostReadCount"],
  ["s.breaking_max_items", "breakingMaxItems"],
  ["s.default_live_slug", "defaultLiveSlug"],
  ["s.meta_title_bn", "metaTitleBn"],
  ["s.meta_title_en", "metaTitleEn"],
  ["s.meta_description_bn", "metaDescriptionBn"],
  ["s.meta_description_en", "metaDescriptionEn"],
  ["s.og_image_url", "ogImageUrl"],
  ["s.metadata_base_url", "metadataBaseUrl"],
  ["s.updated_by", "updatedById"],
  ["s.created_at", "createdAt"],
  ["s.updated_at", "updatedAt"],
];

/**
 * Fetches the singleton settings row. Always `WHERE id = 1` — the schema's
 * `ck_site_settings_single_row` check guarantees at most one row, so this is
 * a single trivial primary-key lookup with no joins and no pagination.
 * Returns undefined when the row has not been seeded.
 */
export async function findSettings(em: EntityManager): Promise<SettingsRow | undefined> {
  const qb = em.createQueryBuilder().from(SiteSettings, "s");
  for (const [column, alias] of SELECT) qb.addSelect(column, alias);
  qb.where("s.id = :id", { id: SETTINGS_ID });
  return (await qb.getRawOne<SettingsRow>()) ?? undefined;
}

/**
 * Applies a partial update to the singleton row. Only the caller-provided
 * columns are written (never id, createdAt or updatedById), so unspecified
 * fields are preserved exactly. The updated_at timestamp is prefixed by the
 * service on every write. Returns false when the row does not exist.
 */
export async function updateSettings(
  em: EntityManager,
  values: SettingsUpdateValues,
): Promise<boolean> {
  const result = await em
    .createQueryBuilder()
    .update(SiteSettings)
    .set(values)
    .where("id = :id", { id: SETTINGS_ID })
    .execute();
  return (result.affected ?? 0) > 0;
}

/** True when a live stream with the given slug exists (default_live_slug reference). */
export async function liveStreamExists(em: EntityManager, slug: string): Promise<boolean> {
  const row = await em
    .getRepository(LiveStream)
    .createQueryBuilder("l")
    .select("l.id", "id")
    .where("l.slug = :slug", { slug })
    .getRawOne<{ id: string }>();
  return row !== undefined;
}