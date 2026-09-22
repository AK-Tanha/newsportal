import type { EntityManager, SelectQueryBuilder } from "typeorm";
import { IsNull } from "typeorm";
import { Article } from "../db/entities/article";
import { ArticleContent } from "../db/entities/article-content";
import { Category } from "../db/entities/category";
import { Media } from "../db/entities/media";
import { User } from "../db/entities/user";
import type { Locale } from "../db/entities/enums";
import { findTagsForArticle, type ResolvedTag } from "./tags";
import type { ListQueryParams } from "./article-types";

export interface ArticleListRow {
  id: string;
  slug: string;
  categoryId: number;
  status: string;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  title: string | null;
  summary: string | null;
  readTimeMinutes: number | null;
  categorySlug: string;
  categoryNameBn: string;
  categoryNameEn: string;
  categoryColor: string;
  mediaUrl: string | null;
  mediaAlt: string | null;
  authorId: string | null;
  authorName: string | null;
  rank?: number | null;
}

export interface ArticleDetailRow {
  id: string;
  slug: string;
  categoryId: number;
  status: string;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  categorySlug: string;
  categoryNameBn: string;
  categoryNameEn: string;
  categoryColor: string;
  mediaUrl: string | null;
  mediaAlt: string | null;
  authorId: string | null;
  authorName: string | null;
}

export interface ArticleContentRow {
  locale: Locale;
  title: string;
  summary: string;
  body: string;
  readTimeMinutes: number | null;
}

export interface ArticleDetailRaw {
  article: ArticleDetailRow;
  contents: ArticleContentRow[];
  tags: ResolvedTag[];
}

export interface ArticleListResult {
  rows: ArticleListRow[];
  hasNext?: boolean;
  count?: number;
}

const LIST_SELECTS = (qb: SelectQueryBuilder<Article>, search?: string): void => {
  qb.select("a.id", "id")
    .addSelect("a.slug", "slug")
    .addSelect("a.category_id", "categoryId")
    .addSelect("a.status", "status")
    .addSelect("a.is_featured", "isFeatured")
    .addSelect("a.is_breaking", "isBreaking")
    .addSelect("a.published_at", "publishedAt")
    .addSelect("a.created_at", "createdAt")
    .addSelect("a.updated_at", "updatedAt")
    .addSelect("ac.title", "title")
    .addSelect("ac.summary", "summary")
    .addSelect("ac.read_time_minutes", "readTimeMinutes")
    .addSelect("c.slug", "categorySlug")
    .addSelect("c.name_bn", "categoryNameBn")
    .addSelect("c.name_en", "categoryNameEn")
    .addSelect("c.color", "categoryColor")
    .addSelect("m.url", "mediaUrl")
    .addSelect("m.alt", "mediaAlt")
    .addSelect("u.id", "authorId")
    .addSelect("u.full_name", "authorName")
    .addSelect("a.deleted_at", "deletedAt");
  if (search) qb.addSelect("s.rank", "rank");
};

/**
 * Builds the shared article query: from/to-one joins for display, the locale
 * content row, and every list filter. Ordering and pagination are applied by
 * the caller so the same builder powers public, admin and count queries.
 */
function baseArticleQuery(
  em: EntityManager,
  params: ListQueryParams,
): SelectQueryBuilder<Article> {
  const qb = em
    .createQueryBuilder()
    .from(Article, "a")
    .leftJoin(
      "article_contents",
      "ac",
      "ac.article_id = a.id AND ac.locale = :locale",
      { locale: params.locale },
    )
    .leftJoin("categories", "c", "c.id = a.category_id")
    .leftJoin("media", "m", "m.id = a.featured_media_id")
    .leftJoin("users", "u", "u.id = a.author_id")
    .andWhere("a.deleted_at IS NULL");

  if (params.mode === "public") {
    qb.andWhere("a.status = 'published'");
  } else if (params.status) {
    qb.andWhere("a.status = :status", { status: params.status });
  }

  if (params.categorySlug) {
    qb.andWhere("c.slug = :categorySlug", { categorySlug: params.categorySlug });
  }
  if (params.tagSlug) {
    qb.andWhere(
      "EXISTS (SELECT 1 FROM article_tags at2 JOIN tags t2 ON t2.id = at2.tag_id WHERE at2.article_id = a.id AND t2.slug = :tagSlug)",
      { tagSlug: params.tagSlug },
    );
  }
  if (params.authorId) {
    qb.andWhere("a.author_id = :authorId", { authorId: params.authorId });
  }
  if (params.featured !== undefined) {
    qb.andWhere("a.is_featured = :featured", { featured: params.featured });
  }
  if (params.breaking !== undefined) {
    qb.andWhere("a.is_breaking = :breaking", { breaking: params.breaking });
  }

  if (params.search) {
    qb.andWhere(
      "EXISTS (SELECT 1 FROM article_contents match WHERE match.article_id = a.id AND match.search_tsv @@ plainto_tsquery('simple', :search))",
      { search: params.search },
    ).leftJoin(
      (sub) =>
        sub
          .select("ac.article_id", "article_id")
          .addSelect(
            "MAX(ts_rank_cd(ac.search_tsv, plainto_tsquery('simple', :search)))",
            "rank",
          )
          .from("article_contents", "ac")
          .where("ac.search_tsv @@ plainto_tsquery('simple', :search)")
          .groupBy("ac.article_id"),
      "s",
      "s.article_id = a.id",
    );
  }

  return qb;
}

/** Lists articles. Public feeds use keyset pagination; admin feeds use offsets. */
export async function findArticles(
  em: EntityManager,
  params: ListQueryParams,
): Promise<ArticleListResult> {
  if (params.mode === "public") {
    const qb = baseArticleQuery(em, params);
    LIST_SELECTS(qb, params.search);

    if (params.cursor) {
      if (params.search) {
        qb.andWhere(
          "(s.rank < :rank OR (s.rank = :rank AND (a.published_at < :pub OR (a.published_at = :pub AND a.id < :id))))",
          {
            rank: params.cursor.rank ?? 0,
            pub: params.cursor.publishedAt,
            id: params.cursor.id,
          },
        );
      } else {
        qb.andWhere(
          "(a.published_at < :pub OR (a.published_at = :pub AND a.id < :id))",
          { pub: params.cursor.publishedAt, id: params.cursor.id },
        );
      }
    }

    qb.orderBy(params.search ? "s.rank" : "a.published_at", "DESC")
      .addOrderBy("a.published_at", "DESC")
      .addOrderBy("a.id", "DESC")
      .limit(params.limit + 1);

    const rows = await qb.getRawMany<ArticleListRow>();
    const hasNext = rows.length > params.limit;
    return { rows: hasNext ? rows.slice(0, params.limit) : rows, hasNext };
  }

  const qb = baseArticleQuery(em, params);
  LIST_SELECTS(qb, params.search);
  qb.orderBy("a.created_at", "DESC")
    .addOrderBy("a.id", "DESC")
    .offset(((params.page ?? 1) - 1) * params.limit)
    .limit(params.limit);
  const rows = await qb.getRawMany<ArticleListRow>();
  const count = await countArticles(em, params);
  return { rows, count };
}

export async function countArticles(
  em: EntityManager,
  params: ListQueryParams,
): Promise<number> {
  const qb = baseArticleQuery(em, params).select("a.id");
  return qb.getCount();
}

export interface DetailOptions {
  publicOnly?: boolean;
}

export interface ArticleIdentifier {
  id?: string;
  slug?: string;
}

/**
 * Fetches one article row (by id or slug) with its category/media/author,
 * contents and tags. Soft-deleted articles and (optionally) unpublished
 * articles are treated as not found.
 */
export async function findArticleDetail(
  em: EntityManager,
  identifier: ArticleIdentifier,
  options: DetailOptions = {},
): Promise<ArticleDetailRaw | undefined> {
  const qb = em
    .createQueryBuilder()
    .select("a.id", "id")
    .addSelect("a.slug", "slug")
    .addSelect("a.category_id", "categoryId")
    .addSelect("a.status", "status")
    .addSelect("a.is_featured", "isFeatured")
    .addSelect("a.is_breaking", "isBreaking")
    .addSelect("a.published_at", "publishedAt")
    .addSelect("a.created_at", "createdAt")
    .addSelect("a.updated_at", "updatedAt")
    .addSelect("a.deleted_at", "deletedAt")
    .addSelect("c.slug", "categorySlug")
    .addSelect("c.name_bn", "categoryNameBn")
    .addSelect("c.name_en", "categoryNameEn")
    .addSelect("c.color", "categoryColor")
    .addSelect("m.url", "mediaUrl")
    .addSelect("m.alt", "mediaAlt")
    .addSelect("u.id", "authorId")
    .addSelect("u.full_name", "authorName")
    .from(Article, "a")
    .leftJoin("categories", "c", "c.id = a.category_id")
    .leftJoin("media", "m", "m.id = a.featured_media_id")
    .leftJoin("users", "u", "u.id = a.author_id")
    .where("a.deleted_at IS NULL");

  if (identifier.id !== undefined) {
    qb.andWhere("a.id = :id", { id: identifier.id });
  }
  if (identifier.slug !== undefined) {
    qb.andWhere("a.slug = :slug", { slug: identifier.slug });
  }

  if (options.publicOnly) {
    qb.andWhere("a.status = 'published'");
  }

  const article = await qb.getRawOne<ArticleDetailRow>();
  if (!article) return undefined;

  const contents = await findArticleContents(em, article.id);
  const tags = await findTagsForArticle(em, article.id);
  return { article, contents, tags };
}

export async function findArticleContents(
  em: EntityManager,
  id: string,
): Promise<ArticleContentRow[]> {
  return em
    .createQueryBuilder()
    .select("ac.locale", "locale")
    .addSelect("ac.title", "title")
    .addSelect("ac.summary", "summary")
    .addSelect("ac.body", "body")
    .addSelect("ac.read_time_minutes", "readTimeMinutes")
    .from(ArticleContent, "ac")
    .where("ac.article_id = :id", { id })
    .orderBy("ac.locale", "ASC")
    .getRawMany<ArticleContentRow>();
}

/** True when a category with the given slug exists. */
export async function findCategoryIdBySlug(
  em: EntityManager,
  slug: string,
): Promise<number | undefined> {
  const row = await em
    .getRepository(Category)
    .createQueryBuilder("c")
    .select("c.id", "id")
    .where("c.slug = :slug", { slug })
    .getRawOne<{ id: number }>();
  return row?.id;
}

export async function mediaExists(em: EntityManager, id: string): Promise<boolean> {
  return (await em.findOne(Media, { where: { id } })) !== null;
}

export async function userExists(em: EntityManager, id: string): Promise<boolean> {
  const row = await em
    .getRepository(User)
    .createQueryBuilder("u")
    .select("u.id", "id")
    .where("u.id = :id", { id })
    .getRawOne<{ id: string }>();
  return row !== undefined;
}

/** True when an article already uses the slug (mirrors the DB unique index). */
export async function slugExists(
  em: EntityManager,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const qb = em
    .getRepository(Article)
    .createQueryBuilder("a")
    .select("a.id", "id")
    .where("a.slug = :slug", { slug });
  if (excludeId) qb.andWhere("a.id <> :excludeId", { excludeId });
  return (await qb.getRawOne<{ id: string }>()) !== undefined;
}

/** Loads one non-deleted article row for update flows. */
export async function findArticleById(
  em: EntityManager,
  id: string,
): Promise<Article | undefined> {
  return (await em.findOne(Article, { where: { id, deletedAt: IsNull() } })) ?? undefined;
}

/** Soft-deletes an article by stamping deleted_at. Returns false if absent. */
export async function softDeleteArticle(em: EntityManager, id: string): Promise<boolean> {
  const result = await em
    .createQueryBuilder()
    .update(Article)
    .set({ deletedAt: new Date() })
    .where("id = :id AND deleted_at IS NULL", { id })
    .execute();
  return (result.affected ?? 0) > 0;
}