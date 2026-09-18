"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  categoryColor,
  categoryName,
  categoryOptions,
  formatPublishedDate,
} from "@/lib/admin-articles";
import type { CategorySlug } from "@/lib/news";
import type { CmsVideo, CmsVideoStatus } from "@/lib/admin-videos";
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { SearchInput, Select } from "@/components/admin/ui/inputs";
import { Badge, CategoryChip } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { Modal } from "@/components/admin/ui/Modal";
import { Pagination } from "@/components/admin/ui/Pagination";
import { removeStoredVideoById, seedStoredVideos, useStoredVideos } from "./storage";

const PAGE_SIZE = 8;
type CategoryFilter = "all" | CategorySlug;
type StatusFilter = "all" | CmsVideoStatus;

export default function VideosManager({
  seeds,
}: {
  seeds: CmsVideo[];
}) {
  const stored = useStoredVideos();
  const videos = stored ?? seeds;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<CmsVideo | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    seedStoredVideos(seeds);
  }, [seeds]);

  const hasActiveFilters =
    query.trim() !== "" || category !== "all" || status !== "all";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((video) => {
      const matchesQuery =
        q === "" ||
        video.title.toLowerCase().includes(q) ||
        video.summary.toLowerCase().includes(q) ||
        video.slug.toLowerCase().includes(q);
      const matchesCategory = category === "all" || video.category === category;
      const matchesStatus = status === "all" || video.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [videos, query, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  const confirmDelete = () => {
    if (!deleting) return;
    removeStoredVideoById(deleting.id);
    setNotice(`"${deleting.title}" deleted from this browser (demo).`);
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      {notice && (
        <Alert tone="success">{notice}</Alert>
      )}

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search title, summary, slug…"
            className="w-full lg:max-w-xs lg:flex-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as CategoryFilter);
                  setPage(1);
                }}
                aria-label="Filter by category"
                className="w-auto"
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
                className="w-auto"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="md" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
            <Link
              href="/admin/videos/new"
              className={buttonClasses("primary", "md")}
            >
              <PlusIcon className="h-4 w-4" />
              New Video
            </Link>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3">Thumbnail</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No videos match your filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-1 text-sm font-semibold text-brand hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {pageItems.map((video) => (
                <tr key={video.id} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-3">
                    <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
                      <Image
                        src={video.image}
                        alt={video.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="max-w-[280px] px-4 py-3">
                    <p className="line-clamp-2 font-semibold text-ink-900">
                      {video.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">/{video.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryChip
                      name={categoryName(video.category)}
                      color={categoryColor(video.category)}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{video.duration || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                      {video.views || "0"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {video.status === "published" ? (
                      <Badge tone="green" dot>Published</Badge>
                    ) : (
                      <Badge tone="amber" dot>Draft</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatPublishedDate(video.publishedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        aria-label={`Edit ${video.title}`}
                        className={buttonClasses("outline", "sm")}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleting(video)}
                        aria-label={`Delete ${video.title}`}
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
            total={filtered.length}
            itemLabel="videos"
            onPageChange={setPage}
          />
        </div>
      </Card>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete video?"
        description={`"${deleting?.title ?? ""}" will be removed from this browser only (demo). This cannot be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}