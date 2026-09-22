import { getInitializedDataSource } from "../db/data-source";
import { Errors } from "./settings-errors";
import { toSettingsDto } from "./settings-mapper";
import { findSettings, liveStreamExists, updateSettings } from "./settings-repository";
import type { SettingsDto, SettingsUpdateValues, UpdateSettingsInput } from "./settings-types";

/**
 * Copies only the fields actually present in the patch into the update
 * values. Nullable columns are copied verbatim (null clears the row); keys
 * that are absent stay absent so `EntityManager.update` never touches them.
 */
function toUpdateValues(input: UpdateSettingsInput): SettingsUpdateValues {
  const values: SettingsUpdateValues = {};
  const fields: Array<
    [keyof UpdateSettingsInput, keyof SettingsUpdateValues]
  > = [
    ["siteNameBn", "siteNameBn"],
    ["siteNameEn", "siteNameEn"],
    ["taglineBn", "taglineBn"],
    ["taglineEn", "taglineEn"],
    ["logoUrl", "logoUrl"],
    ["faviconUrl", "faviconUrl"],
    ["newsletterEmail", "newsletterEmail"],
    ["editorNameBn", "editorNameBn"],
    ["editorNameEn", "editorNameEn"],
    ["facebookUrl", "facebookUrl"],
    ["twitterUrl", "twitterUrl"],
    ["instagramUrl", "instagramUrl"],
    ["youtubeUrl", "youtubeUrl"],
    ["latestArticlesCount", "latestArticlesCount"],
    ["mostReadCount", "mostReadCount"],
    ["breakingMaxItems", "breakingMaxItems"],
    ["defaultLiveSlug", "defaultLiveSlug"],
    ["metaTitleBn", "metaTitleBn"],
    ["metaTitleEn", "metaTitleEn"],
    ["metaDescriptionBn", "metaDescriptionBn"],
    ["metaDescriptionEn", "metaDescriptionEn"],
    ["ogImageUrl", "ogImageUrl"],
    ["metadataBaseUrl", "metadataBaseUrl"],
  ];
  for (const [inputField, valueField] of fields) {
    if (input[inputField] !== undefined) {
      (values as Record<string, unknown>)[valueField] = input[inputField];
    }
  }
  return values;
}

async function loadSettingsOrThrow(): Promise<SettingsDto> {
  const ds = await getInitializedDataSource();
  const row = await findSettings(ds.manager);
  if (!row) throw Errors.settingsNotConfigured();
  return toSettingsDto(row);
}

export const settingsService = {
  /**
   * Returns the current site settings. The singleton row (id = 1) is read
   * with a single primary-key lookup. Note for later: the settings record
   * changes infrequently, so a public variant of this read is a safe
   * candidate for caching.
   */
  async getSettings(): Promise<SettingsDto> {
    return loadSettingsOrThrow();
  },

  /**
   * Applies a partial update to the singleton settings row inside a
   * transaction. Omitted fields are preserved; nullable fields accept null to
   * clear. updatedById is stamped from the authenticated admin session (never
   * accepted from the client). The write targets id = 1 exclusively (the
   * schema's ck_site_settings_single_row check guarantees a single row) and
   * never creates additional rows.
   */
  async updateSettings(
    input: UpdateSettingsInput,
    options?: { actorId?: string },
  ): Promise<SettingsDto> {
    const actorId = options?.actorId ?? null;
    const ds = await getInitializedDataSource();
    return ds.transaction(async (em) => {
      const current = await findSettings(em);
      if (!current) throw Errors.settingsNotConfigured();

      if (input.defaultLiveSlug !== undefined && input.defaultLiveSlug !== null) {
        if (!(await liveStreamExists(em, input.defaultLiveSlug))) {
          throw Errors.validation([
            {
              field: "defaultLiveSlug",
              issues: [`No live stream with the slug "${input.defaultLiveSlug}".`],
            },
          ]);
        }
      }

      const values = toUpdateValues(input);
      if (Object.keys(values).length > 0 || actorId) {
        values.updatedAt = new Date();
        if (actorId) values.updatedById = actorId;
        await updateSettings(em, values);
      }

      const row = await findSettings(em);
      if (!row) throw Errors.settingsNotConfigured();
      return toSettingsDto(row);
    });
  },
};