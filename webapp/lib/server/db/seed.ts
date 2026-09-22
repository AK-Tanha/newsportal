import type { DataSource, ObjectLiteral, Repository } from "typeorm";
import {
  categories,
  articleSources,
  type CategorySlug,
  type Localized,
} from "@/lib/news";
import { videoSources } from "@/lib/videos";
import { liveStreamSources, activeLiveStreamSlug } from "@/lib/live";
import { adSources } from "@/lib/ads";
import { getCmsMediaSeeds } from "@/lib/admin-media";
import { getCmsArticleSeeds, slugifyTitle } from "@/lib/admin-articles";
import { getCmsVideoSeeds } from "@/lib/admin-videos";
import { getDefaultCmsSettings } from "@/lib/admin-settings";
import {
  Advertisement,
  AdvertisementPlacement,
  Article,
  ArticleContent,
  ArticleTag,
  Category,
  LiveStream,
  Media,
  SiteSettings,
  Tag,
  User,
  Video,
} from "@/lib/server/db/entities";
import { hashPassword } from "@/lib/server/auth/auth-crypto";

/**
 * Dev-only seed password. A fresh database seeds this admin account with a
 * real bcrypt hash so login works locally. Production must set
 * SEED_ADMIN_PASSWORD (or run `npm run db:set-admin-password`) before go-live
 * — this fallback is never appropriate for a real deployment.
 */
const DEV_SEED_ADMIN_PASSWORD = "rudro-dev-admin-password";

export async function prepareAdminPasswordHash(): Promise<string> {
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEV_SEED_ADMIN_PASSWORD;
  if (!process.env.SEED_ADMIN_PASSWORD) {
    process.stderr.write(
      "  ! SEED_ADMIN_PASSWORD is not set; seeding the admin user with a dev-only password.\n",
    );
  }
  return hashPassword(password);
}

const latinDigits: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

function toLatinDigits(value: string): string {
  return value.replace(/[০-৯]/g, (digit) => latinDigits[digit] ?? digit);
}

function toNumber(value: string): number {
  return Number(toLatinDigits(value).replace(/[^\d]/g, "")) || 0;
}

function parseReadTimeMinutes(value: Localized): number {
  return toNumber(value.bn);
}

function parseDurationSeconds(value: Localized): number {
  const [minutes, seconds] = toLatinDigits(value.bn)
    .split(":")
    .map((part) => Number(part) || 0);
  return minutes * 60 + seconds;
}

function parseDurationString(value: string): number {
  const [minutes, seconds] = toLatinDigits(value)
    .split(":")
    .map((part) => Number(part) || 0);
  return minutes * 60 + seconds;
}

function seedDateIso(index: number): string {
  return new Date(Date.UTC(2026, 8, 18 - index, 9, 0, 0)).toISOString();
}

function draftTagMap(category: CategorySlug): string[] {
  const map: Record<CategorySlug, string[]> = {
    national: ["Government", "Policy"],
    politics: ["Politics", "Parliament"],
    economy: ["Economy", "Budget"],
    international: ["World", "Diplomacy"],
    sports: ["Sports", "Cricket"],
    entertainment: ["Entertainment", "Arts"],
    technology: ["Technology", "Innovation"],
    lifestyle: ["Lifestyle", "Culture"],
  };
  return map[category];
}

async function findOrCreate<T extends ObjectLiteral>(
  repository: Repository<T>,
  entity: T,
  key: string,
): Promise<{ id: number | string; created: boolean }> {
  const existing = await repository.findOne({
    where: { [key]: entity[key] } as never,
  });
  if (existing) return { id: existing.id as number | string, created: false };
  const inserted = (await repository.save(entity)) as unknown as {
    id: number | string;
  };
  return { id: inserted.id, created: true };
}

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const report: string[] = [];

  const userRepository = dataSource.getRepository(User);
  const admin = await findOrCreate(userRepository, userRepository.create({
    email: "admin@rudrokhobor.dev",
    passwordHash: await prepareAdminPasswordHash(),
    fullName: "Rayhan Hossain",
    role: "admin",
  }), "email");
  report.push(`user admin ${admin.created ? "inserted" : "exists"}`);

  const categoryRepository = dataSource.getRepository(Category);
  const categoryMap = new Map<CategorySlug, number>();
  for (const category of categories) {
    const result = await findOrCreate(categoryRepository, categoryRepository.create({
      slug: category.slug,
      nameBn: category.name.bn,
      nameEn: category.name.en,
      color: category.color,
    }), "slug");
    categoryMap.set(category.slug, Number(result.id));
    report.push(`category ${category.slug} ${result.created ? "inserted" : "exists"}`);
  }

  const tagRepository = dataSource.getRepository(Tag);
  const tagMap = new Map<string, string>();
  async function ensureTag(name: string): Promise<string> {
    const slug = slugifyTitle(name);
    if (tagMap.has(slug)) return tagMap.get(slug)!;
    const result = await findOrCreate(tagRepository, tagRepository.create({ slug, name }), "slug");
    tagMap.set(slug, String(result.id));
    return String(result.id);
  }

  const allTagNames = new Set<string>();
  for (const article of articleSources) {
    draftTagMap(article.category).forEach((tag) => allTagNames.add(tag));
  }
  for (const article of getCmsArticleSeeds().filter((a) => a.status === "draft")) {
    article.tags.forEach((tag) => allTagNames.add(tag));
  }
  for (const name of allTagNames) {
    report.push(`tag ${name} -> ${await ensureTag(name)}`);
  }

  const mediaRepository = dataSource.getRepository(Media);
  const mediaUrlMap = new Map<string, string>();
  for (const media of getCmsMediaSeeds()) {
    const result = await findOrCreate(mediaRepository, mediaRepository.create({
      filename: media.filename,
      url: media.url,
      type: media.type,
      width: media.width,
      height: media.height,
      sizeBytes: null,
      mimeType: media.type === "image" ? "image/jpeg" : "video/mp4",
      alt: media.alt,
      uploaderId: String(admin.id),
      createdAt: new Date(media.createdAt),
    }), "url");
    mediaUrlMap.set(media.url, String(result.id));
    report.push(`media ${media.filename} ${result.created ? "inserted" : "exists"}`);
  }

  const articleRepository = dataSource.getRepository(Article);
  const articleContentRepository = dataSource.getRepository(ArticleContent);
  const articleTagRepository = dataSource.getRepository(ArticleTag);
  const drafts = getCmsArticleSeeds().filter((article) => article.status === "draft");

  let articleIndex = 0;
  for (const source of articleSources) {
    const categoryId = categoryMap.get(source.category);
    if (!categoryId) continue;
    const result = await findOrCreate(articleRepository, articleRepository.create({
      slug: source.slug,
      categoryId,
      createdById: String(admin.id),
      updatedById: String(admin.id),
      publishedById: String(admin.id),
      status: "published",
      isFeatured: source.featured,
      isBreaking: source.breaking,
      publishedAt: seedDateIso(articleIndex),
      featuredMediaId: mediaUrlMap.has(source.image) ? mediaUrlMap.get(source.image)! : null,
    }), "slug");
    const articleId = String(result.id);
    articleIndex += 1;

    if (result.created) {
      for (const locale of ["bn", "en"] as const) {
        await articleContentRepository.save(articleContentRepository.create({
          articleId,
          locale,
          title: source.title[locale],
          summary: source.summary[locale],
          body: source.content.map((paragraph) => paragraph[locale]).join("\n\n"),
          readTimeMinutes: parseReadTimeMinutes(source.readTime),
        }));
      }
      for (const tagName of draftTagMap(source.category)) {
        await articleTagRepository.save(articleTagRepository.create({
          articleId,
          tagId: await ensureTag(tagName),
        }));
      }
    }
    report.push(`article ${source.slug} ${result.created ? "inserted" : "exists"}`);
  }

  for (const draft of drafts) {
    const result = await findOrCreate(articleRepository, articleRepository.create({
      slug: draft.slug,
      categoryId: categoryMap.get(draft.category)!,
      createdById: String(admin.id),
      updatedById: String(admin.id),
      status: "draft",
      isFeatured: false,
      isBreaking: false,
      publishedAt: null,
      featuredMediaId: mediaUrlMap.has(draft.image) ? mediaUrlMap.get(draft.image)! : null,
    }), "slug");
    const articleId = String(result.id);

    if (result.created) {
      for (const locale of ["bn", "en"] as const) {
        await articleContentRepository.save(articleContentRepository.create({
          articleId,
          locale,
          title: locale === "en" ? draft.title : `[খসড়া] ${slugifyTitle(draft.title)}`,
          summary: draft.summary,
          body: draft.content || "",
          readTimeMinutes: 3,
        }));
      }
      for (const tagName of draft.tags) {
        await articleTagRepository.save(articleTagRepository.create({
          articleId,
          tagId: await ensureTag(tagName),
        }));
      }
    }
    report.push(`article ${draft.slug} ${result.created ? "inserted" : "exists"}`);
  }

  const videoRepository = dataSource.getRepository(Video);
  let videoIndex = 0;
  for (const source of videoSources) {
    const categoryId = categoryMap.get(source.category);
    if (!categoryId) continue;
    const result = await findOrCreate(videoRepository, videoRepository.create({
      slug: source.slug,
      categoryId,
      titleBn: source.title.bn,
      titleEn: source.title.en,
      summaryBn: source.summary.bn,
      summaryEn: source.summary.en,
      videoUrl: source.videoUrl,
      durationSeconds: parseDurationSeconds(source.duration),
      viewsCount: toNumber(source.views),
      featured: source.featured,
      status: "published",
      publishedAt: seedDateIso(videoIndex),
      posterMediaId: mediaUrlMap.has(source.image) ? mediaUrlMap.get(source.image)! : null,
    }), "slug");
    videoIndex += 1;
    report.push(`video ${source.slug} ${result.created ? "inserted" : "exists"}`);
  }

  for (const video of getCmsVideoSeeds().filter((v) => v.status === "draft")) {
    const categoryId = categoryMap.get(video.category);
    if (!categoryId) continue;
    const result = await findOrCreate(videoRepository, videoRepository.create({
      slug: video.slug,
      categoryId,
      titleBn: video.title,
      titleEn: video.title,
      summaryBn: video.summary,
      summaryEn: video.summary,
      videoUrl: video.videoUrl,
      durationSeconds: parseDurationString(video.duration),
      viewsCount: toNumber(video.views),
      featured: video.featured,
      status: "draft",
      publishedAt: null,
      posterMediaId: mediaUrlMap.has(video.image) ? mediaUrlMap.get(video.image)! : null,
    }), "slug");
    report.push(`video ${video.slug} ${result.created ? "inserted" : "exists"}`);
  }

  const liveRepository = dataSource.getRepository(LiveStream);
  for (const stream of liveStreamSources) {
    const categoryId = categoryMap.get(stream.category);
    if (!categoryId) continue;
    const result = await findOrCreate(liveRepository, liveRepository.create({
      slug: stream.slug,
      categoryId,
      titleBn: stream.title.bn,
      titleEn: stream.title.en,
      descriptionBn: stream.description.bn,
      descriptionEn: stream.description.en,
      streamUrl: stream.streamUrl,
      isActive: stream.slug === activeLiveStreamSlug,
      status: stream.status,
      startedAt: "2026-09-15T09:00:00.000Z",
      viewerCount: toNumber(stream.viewers),
      posterMediaId: mediaUrlMap.has(stream.poster) ? mediaUrlMap.get(stream.poster)! : null,
    }), "slug");
    report.push(`live_stream ${stream.slug} ${result.created ? "inserted" : "exists"}`);
  }

  const adRepository = dataSource.getRepository(Advertisement);
  const placementRepository = dataSource.getRepository(AdvertisementPlacement);
  for (const source of adSources) {
    const result = await findOrCreate(adRepository, adRepository.create({
      slug: source.slug,
      type: source.type,
      titleBn: source.title.bn,
      titleEn: source.title.en,
      descriptionBn: source.description?.bn ?? null,
      descriptionEn: source.description?.en ?? null,
      targetUrl: source.link.en,
      alt: source.title.en,
      isActive: true,
      imageMediaId: source.image && mediaUrlMap.has(source.image) ? mediaUrlMap.get(source.image)! : null,
    }), "slug");
    if (result.created) {
      for (const placement of source.placements) {
        await placementRepository.save(placementRepository.create({
          advertisementId: String(result.id),
          placement,
        }));
      }
    }
    report.push(`ad ${source.slug} ${result.created ? "inserted" : "exists"}`);
  }

  const settings = getDefaultCmsSettings();
  const settingsRepository = dataSource.getRepository(SiteSettings);
  const settingsResult = await findOrCreate(settingsRepository, settingsRepository.create({
    id: 1,
    siteNameBn: settings.siteNameBn,
    siteNameEn: settings.siteNameEn,
    taglineBn: settings.taglineBn,
    taglineEn: settings.taglineEn,
    logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl,
    newsletterEmail: settings.newsletterEmail,
    editorNameBn: settings.editorNameBn,
    editorNameEn: settings.editorNameEn,
    facebookUrl: settings.facebookUrl,
    twitterUrl: settings.twitterUrl,
    instagramUrl: settings.instagramUrl,
    youtubeUrl: settings.youtubeUrl,
    latestArticlesCount: settings.latestArticlesCount,
    mostReadCount: settings.mostReadCount,
    breakingMaxItems: settings.breakingMaxItems,
    defaultLiveSlug: settings.defaultLiveSlug,
    metaTitleBn: settings.metaTitleBn,
    metaTitleEn: settings.metaTitleEn,
    metaDescriptionBn: settings.metaDescriptionBn,
    metaDescriptionEn: settings.metaDescriptionEn,
    ogImageUrl: settings.ogImageUrl,
    metadataBaseUrl: settings.metadataBaseUrl,
    updatedById: String(admin.id),
  }), "id");
  report.push(`site_settings ${settingsResult.created ? "inserted" : "exists"}`);

  for (const line of report) process.stdout.write(`  - ${line}\n`);
}