import type { EntityManager } from "typeorm";
import { Tag } from "../db/entities/tag";

export interface ResolvedTag {
  id: string;
  slug: string;
  name: string;
}

const SLUG_SAFE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Derives a tag slug from a display name, matching the slug convention used
 * across the seed data (ascii slugs, single hyphens, trimmed).
 */
export function slugifyTag(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function isTagSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 100 && SLUG_SAFE.test(slug);
}

/**
 * Resolves tag names to existing tag rows, creating any that do not exist yet.
 * Tags are matched by slug (deduplicated by slug), so "Health" and "health"
 * resolve to the same tag. Existing tags keep their stored display name; only
 * newly-created tags take the submitted name.
 */
export async function ensureTags(
  manager: EntityManager,
  names: string[],
): Promise<ResolvedTag[]> {
  const resolved = new Map<string, ResolvedTag>();
  const seen = new Set<string>();

  for (const rawName of names) {
    const name = rawName.trim();
    const slug = slugifyTag(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    let tag = resolved.get(slug) ?? (await manager.findOne(Tag, { where: { slug } }));
    if (!tag) {
      tag = await manager.save(Tag, manager.create(Tag, { slug, name }));
    }
    resolved.set(slug, { id: tag.id, slug: tag.slug, name: tag.name });
  }

  return [...resolved.values()];
}

/** Loads the tag rows assigned to an article, ordered by tag id. */
export async function findTagsForArticle(
  manager: EntityManager,
  articleId: string,
): Promise<ResolvedTag[]> {
  return manager
    .createQueryBuilder()
    .select("t.id", "id")
    .addSelect("t.slug", "slug")
    .addSelect("t.name", "name")
    .from("article_tags", "at")
    .innerJoin("tags", "t", "t.id = at.tag_id")
    .where("at.article_id = :articleId", { articleId })
    .orderBy("t.id", "ASC")
    .getRawMany();
}