"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  categoryColor,
  categoryName,
  categoryOptions,
} from "@/lib/admin-articles";
import type { CategorySlug } from "@/lib/news";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { SearchInput, Select } from "@/components/admin/ui/inputs";
import { Badge, CategoryChip } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { Modal } from "@/components/admin/ui/Modal";
import { Pagination } from "@/components/admin/ui/Pagination";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import {
  articlesApi,
  apiErrorMessage,
  type ArticleStatus,
  type ArticleSummaryDto,
} from "./api";

const PAGE_SIZE = 10;
type CategoryFilter = "all" | CategorySlug;
type StatusFilter = "all" | ArticleStatus;

function formatPublishedDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** The CMS category slugs match the backend category table slugs one-to-one. */
function asCategorySlug(slug: string): CategorySlug {
  return slug as CategorySlug;
}

export default function ArticlesManager() {
  const [articles, setArticles] = useState<ArticleSummaryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ArticleSummaryDto | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestSeq = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const hasActiveFilters =
    debouncedQuery !== "" || category !== "all" || status !== "all";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setPage(1);
  };

  const reload = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const sequence = ++requestSeq.current;

    articlesApi
      .list({
        page,
        limit: PAGE_SIZE,
        status: status === "all" ? undefined : status,
        category: category === "all" ? undefined : category,
        search: debouncedQuery || undefined,
      })
      .then((result) => {
        if (requestSeq.current !== sequence) return;
        setArticles(result.data);
        setTotal(result.meta.total ?? result.data.length);
      })
      .catch((err: unknown) => {
        if (requestSeq.current !== sequence) return;
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (requestSeq.current === sequence) setLoading(false);
      });
  }, [page, status, category, debouncedQuery, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  const confirmDelete = async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await articlesApi.remove(deleting.id);
      setNotice(`"${deleting.title}" has been deleted.`);
      setDeleting(null);
      if (articles.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reload();
      }
    } catch (err) {
      setDeleteError(apiErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {notice && <Alert tone="success">{notice}</Alert>}
      {deleteError && <Alert tone="error">{deleteError}</Alert>}

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search title, summary, content…"
            className="w-full md:max-w-xs md:flex-1"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:min-w-0 sm:items-center sm:gap-2">
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as CategoryFilter);
                  setPage(1);
                }}
                aria-label="Filter by category"
                className="w-full sm:w-auto"
              >
                <option value="all">All categories</option>
                {categoryOptions.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as StatusFilter);
                  setPage(1);
                }}
                aria-label="Filter by status"
                className="w-full sm:w-auto"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="md"
                onClick={resetFilters}
                className="w-full sm:w-auto"
              >
                Clear filters
              </Button>
            )}
            <Link
              href="/admin/articles/new"
              className={buttonClasses("primary", "md", "w-full sm:w-auto")}
            >
              <PlusIcon className="h-4 w-4" />
              New Article
            </Link>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        {loading && articles.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">Loading articles…</p>
          </div>
        ) : error ? (
          <div className="px-4 py-8">
            <Alert tone="error" title="Couldn't load articles">
              <p>{error}</p>
              <button
                type="button"
                onClick={reload}
                className="mt-1 text-sm font-semibold underline"
              >
                Try again
              </button>
            </Alert>
          </div>
        ) : articles.length === 0 ? (
          <div className="px-4 py-10">
            <EmptyState
              title={
                hasActiveFilters
                  ? "No articles match your filters."
                  : "No articles yet."
              }
              description={
                hasActiveFilters
                  ? "Try clearing the filters to see all articles."
                  : "Create your first article from the database."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 md:hidden">
              {articles.map((article) => (
                <li key={article.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
                      {article.image ? (
                        <Image
                          src={article.image.url}
                          alt={article.image.alt ?? article.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-ink-900">
                        {article.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        /{article.slug}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <CategoryChip
                          name={categoryName(asCategorySlug(article.category.slug))}
                          color={categoryColor(asCategorySlug(article.category.slug))}
                        />
                        {article.status === "published" ? (
                          <Badge tone="green" dot>Published</Badge>
                        ) : (
                          <Badge tone="amber" dot>Draft</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500">
                    <span className="truncate">
                      {article.author?.name ?? "—"}
                    </span>
                    <span className="shrink-0">
                      {formatPublishedDate(article.publishedAt)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      aria-label={`Edit ${article.title}`}
                      className={buttonClasses("outline", "sm", "w-full")}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleting(article);
                      }}
                      aria-label={`Delete ${article.title}`}
                      className={buttonClasses("dangerOutline", "sm", "w-full")}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3">Thumbnail</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Published</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="transition-colors hover:bg-gray-50/70"
                    >
                      <td className="px-4 py-3">
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
                          {article.image ? (
                            <Image
                              src={article.image.url}
                              alt={article.image.alt ?? article.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="max-w-[280px] px-4 py-3">
                        <p className="line-clamp-2 font-semibold text-ink-900">
                          {article.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          /{article.slug}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryChip
                          name={categoryName(asCategorySlug(article.category.slug))}
                          color={categoryColor(asCategorySlug(article.category.slug))}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {article.author?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {article.status === "published" ? (
                          <Badge tone="green" dot>Published</Badge>
                        ) : (
                          <Badge tone="amber" dot>Draft</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatPublishedDate(article.publishedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            aria-label={`Edit ${article.title}`}
                            className={buttonClasses("outline", "sm")}
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleting(article);
                            }}
                            aria-label={`Delete ${article.title}`}
                            className={buttonClasses("dangerOutline", "sm")}
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3.5 sm:flex-row">
              <Pagination
                page={safePage}
                totalPages={totalPages}
                from={from}
                to={to}
                total={total}
                itemLabel="articles"
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete article?"
        description={`"${deleting?.title ?? ""}" will be soft-deleted in the database and hidden from all listings. This cannot be undone.`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={deleteBusy}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteBusy}
            >
              {deleteBusy ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      />
    </div>
  );
}