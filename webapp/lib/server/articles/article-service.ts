import type { EntityManager } from "typeorm";
import { Article } from "../db/entities/article";
import { ArticleContent } from "../db/entities/article-content";
import { ArticleTag } from "../db/entities/article-tag";
import type { Locale } from "../db/entities/enums";
import { getInitializedDataSource } from "../db/data-source";
import { Errors } from "./article-errors";
import { toDetail, toListItem } from "./article-mapper";
import {
  findArticleById,
  findArticleDetail,
  findArticles,
  findCategoryIdBySlug,
  mediaExists,
  slugExists,
  softDeleteArticle,
  userExists,
} from "./article-repository";
import type { ArticleDetailDto, ArticleListResult, ArticleListItemDto, ListQueryParams } from "./article-types";
import {
  LOCALES,
  encodeCursor,
  type CreateArticleInput,
  type UpdateArticleInput,
} from "./article-types";
import { ensureTags } from "./tags";

function isUniqueViolation(error: unknown): boolean {
  const candidate = error as {
    driverError?: { code?: string };
    code?: string;
  };
  const code = candidate.driverError?.code ?? candidate.code;
  return code === "23505";
}

function iso(value: Date | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function validateReferenceFields(
  em: EntityManager,
  input: Pick<CreateArticleInput, "category" | "authorId" | "featuredMediaId">,
): Promise<number> {
  const categoryId = await findCategoryIdBySlug(em, input.category);
  if (!categoryId) throw Errors.categoryNotFound(input.category);
  if (input.authorId !== undefined && input.authorId !== null && !(await userExists(em, input.authorId))) {
    throw Errors.authorNotFound(input.authorId);
  }
  if (
    input.featuredMediaId !== undefined &&
    input.featuredMediaId !== null &&
    !(await mediaExists(em, input.featuredMediaId))
  ) {
    throw Errors.mediaNotFound(input.featuredMediaId);
  }
  return categoryId;
}

async function applyTags(
  em: EntityManager,
  articleId: string,
  names: string[] | undefined,
): Promise<void> {
  if (names === undefined) return;
  await em
    .createQueryBuilder()
    .delete()
    .from(ArticleTag)
    .where("article_id = :articleId", { articleId })
    .execute();
  if (names.length === 0) return;
  const tags = await ensureTags(em, names);
  for (const tag of tags) {
    await em.save(em.create(ArticleTag, { articleId, tagId: tag.id }));
  }
}

export const articleService = {
  /** Lists articles. Public feeds use keyset pagination; admin feeds use offsets. */
  async listArticles(params: ListQueryParams): Promise<ArticleListResult> {
    const ds = await getInitializedDataSource();
    const result = await findArticles(ds.manager, params);

    const data: ArticleListItemDto[] = result.rows.map((row) =>
      toListItem(row, params.locale, { admin: params.mode === "admin" }),
    );

    if (params.mode === "public") {
      const last = result.rows[result.rows.length - 1];
      return {
        data,
        meta: {
          mode: "public",
          locale: params.locale,
          limit: params.limit,
          hasNext: result.hasNext,
          nextCursor:
            result.hasNext && last && last.publishedAt
              ? encodeCursor({
                  publishedAt: iso(last.publishedAt) ?? "",
                  id: last.id,
                  ...(last.rank !== undefined && last.rank !== null
                    ? { rank: Number(last.rank) }
                    : {}),
                })
              : undefined,
        },
      };
    }

    return {
      data,
      meta: {
        mode: "admin",
        locale: params.locale,
        limit: params.limit,
        total: result.count,
        page: params.page ?? 1,
      },
    };
  },

  /**
   * Fetches one article by id. Anonymous callers only ever see published
   * articles; an authenticated admin may fetch drafts as well. Soft-deleted
   * articles (and any other miss) return 404 in both modes. There is no
   * admin restore/recovery flow, so deleted articles stay unreachable.
   */
  async getArticle(
    id: string,
    locale: Locale,
    options: { admin?: boolean } = {},
  ): Promise<ArticleDetailDto> {
    const ds = await getInitializedDataSource();
    const raw = await findArticleDetail(ds.manager, { id }, { publicOnly: !options.admin });
    if (!raw) throw Errors.articleNotFound();
    return toDetail(raw, locale);
  },

  /** Fetches one published article by slug (public view). */
  async getArticleBySlug(slug: string, locale: Locale): Promise<ArticleDetailDto> {
    const ds = await getInitializedDataSource();
    const raw = await findArticleDetail(ds.manager, { slug }, { publicOnly: true });
    if (!raw) throw Errors.articleNotFound();
    return toDetail(raw, locale);
  },

  /** Creates an article with localized content and tags, atomically. */
  async createArticle(
    input: CreateArticleInput,
    options?: { actorId?: string },
  ): Promise<string> {
    const actorId = options?.actorId ?? null;
    const ds = await getInitializedDataSource();
    try {
      return await ds.transaction(async (em) => {
        const categoryId = await validateReferenceFields(em, input);
        if (await slugExists(em, input.slug)) throw Errors.slugConflict(input.slug);

        const status = input.status ?? "draft";
        let publishedAt = input.publishedAt;
        if (status === "published" && !publishedAt) {
          publishedAt = new Date().toISOString();
        }

        const saved = await em.save(
          em.create(Article, {
            slug: input.slug,
            categoryId,
            authorId: input.authorId ?? null,
            createdById: actorId,
            updatedById: actorId,
            publishedById: status === "published" ? actorId : null,
            status,
            isFeatured: input.isFeatured ?? false,
            isBreaking: input.isBreaking ?? false,
            publishedAt: publishedAt ? new Date(publishedAt) : null,
            featuredMediaId: input.featuredMediaId ?? null,
          }),
        );

        for (const locale of LOCALES) {
          const content = input.content[locale];
          await em.save(
            em.create(ArticleContent, {
              articleId: saved.id,
              locale,
              title: content.title,
              summary: content.summary,
              body: content.body,
              readTimeMinutes: content.readTimeMinutes ?? null,
            }),
          );
        }

        await applyTags(em, saved.id, input.tags);
        return saved.id;
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw Errors.slugConflict(input.slug);
      throw error;
    }
  },

  /** Applies the validated patch to an article atomically. */
  async updateArticle(
    id: string,
    input: UpdateArticleInput,
    options?: { actorId?: string },
  ): Promise<void> {
    const actorId = options?.actorId ?? null;
    const ds = await getInitializedDataSource();
    try {
      await ds.transaction(async (em) => {
        const article = await findArticleById(em, id);
        if (!article) throw Errors.articleNotFound();

        const values: Partial<Article> = {};

        if (input.slug !== undefined) {
          if (input.slug !== article.slug && (await slugExists(em, input.slug, id))) {
            throw Errors.slugConflict(input.slug);
          }
          values.slug = input.slug;
        }
        if (input.category !== undefined) {
          const categoryId = await findCategoryIdBySlug(em, input.category);
          if (!categoryId) throw Errors.categoryNotFound(input.category);
          values.categoryId = categoryId;
        }
        if (input.authorId !== undefined) {
          if (input.authorId !== null && !(await userExists(em, input.authorId))) {
            throw Errors.authorNotFound(input.authorId);
          }
          values.authorId = input.authorId;
        }
        if (input.featuredMediaId !== undefined) {
          if (
            input.featuredMediaId !== null &&
            !(await mediaExists(em, input.featuredMediaId))
          ) {
            throw Errors.mediaNotFound(input.featuredMediaId);
          }
          values.featuredMediaId = input.featuredMediaId;
        }
        if (input.status !== undefined) values.status = input.status;
        if (input.isFeatured !== undefined) values.isFeatured = input.isFeatured;
        if (input.isBreaking !== undefined) values.isBreaking = input.isBreaking;
        if (input.publishedAt !== undefined) {
          values.publishedAt =
            input.publishedAt === null ? null : new Date(input.publishedAt);
        }

        const nextStatus = values.status ?? article.status;
        const nextPublishedAt =
          values.publishedAt === undefined ? article.publishedAt : values.publishedAt;
        if (nextStatus === "published" && !nextPublishedAt) {
          values.publishedAt = new Date();
        }

        // Audit trail from the authenticated session. The creator is stamped
        // once at insert; each mutation records the actor as `updatedBy`, and
        // the actor is recorded as `publishedBy` at the publish transition.
        if (actorId) {
          values.updatedById = actorId;
          if (nextStatus === "published" && article.status !== "published") {
            values.publishedById = actorId;
          }
        }

        if (Object.keys(values).length > 0) {
          await em.update(Article, id, values);
        }

        if (input.content) {
          for (const locale of LOCALES) {
            const content = input.content[locale];
            if (!content) continue;
            const existing = await em.findOne(ArticleContent, {
              where: { articleId: id, locale },
            });
            const row = {
              title: content.title,
              summary: content.summary,
              body: content.body,
              readTimeMinutes: content.readTimeMinutes ?? null,
            };
            if (existing) {
              await em.update(ArticleContent, { articleId: id, locale }, row);
            } else {
              await em.save(em.create(ArticleContent, { articleId: id, locale, ...row }));
            }
          }
        }

        await applyTags(em, id, input.tags);
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw Errors.slugConflict(input.slug ?? "");
      throw error;
    }
  },

  /** Soft-deletes an article by stamping deleted_at. */
  async deleteArticle(id: string): Promise<void> {
    const ds = await getInitializedDataSource();
    const deleted = await softDeleteArticle(ds.manager, id);
    if (!deleted) throw Errors.articleNotFound();
  },
};