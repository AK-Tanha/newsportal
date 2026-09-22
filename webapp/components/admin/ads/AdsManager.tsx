"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { adPositionLabel, adTypeLabel } from "@/lib/admin-ads";
import type { AdPlacement, AdType } from "@/lib/ads";
import { AdIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { SearchInput, Select } from "@/components/admin/ui/inputs";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { Modal } from "@/components/admin/ui/Modal";
import { Pagination } from "@/components/admin/ui/Pagination";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { adsApi, apiErrorMessage, type AdListItemDto } from "./api";

const PAGE_SIZE = 8;
type PlacementFilter = "all" | AdPlacement;
type TypeFilter = "all" | AdType;
type StatusFilter = "all" | "active" | "inactive";

/** Formats a YYYY-MM-DD calendar date without timezone shifting. */
function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdsManager() {
  const [ads, setAds] = useState<AdListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [placement, setPlacement] = useState<PlacementFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AdListItemDto | null>(null);
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
    debouncedQuery !== "" ||
    placement !== "all" ||
    type !== "all" ||
    status !== "all";

  const resetFilters = () => {
    setQuery("");
    setPlacement("all");
    setType("all");
    setStatus("all");
    setPage(1);
  };

  const reload = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const sequence = ++requestSeq.current;

    adsApi
      .list({
        page,
        limit: PAGE_SIZE,
        search: debouncedQuery || undefined,
        placement: placement === "all" ? undefined : placement,
        type: type === "all" ? undefined : type,
        active: status === "all" ? undefined : status === "active",
      })
      .then((result) => {
        if (requestSeq.current !== sequence) return;
        setError(null);
        setAds(result.data);
        setTotal(result.meta.total ?? result.data.length);
      })
      .catch((err: unknown) => {
        if (requestSeq.current !== sequence) return;
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (requestSeq.current === sequence) setLoading(false);
      });
  }, [page, placement, type, status, debouncedQuery, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  const confirmDelete = async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await adsApi.remove(deleting.id);
      setNotice(`"${deleting.name}" has been deleted.`);
      setDeleting(null);
      if (ads.length === 1 && page > 1) {
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
            placeholder="Search name, description, alt…"
            className="w-full md:max-w-xs md:flex-1"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:min-w-0 sm:items-center sm:gap-2">
              <Select
                value={placement}
                onChange={(e) => {
                  setPlacement(e.target.value as PlacementFilter);
                  setPage(1);
                }}
                aria-label="Filter by placement"
                className="w-full sm:w-auto"
              >
                <option value="all">All placements</option>
                <option value="header">Top header</option>
                <option value="below-hero">Below hero</option>
                <option value="sidebar">Sidebar</option>
                <option value="in-feed">In feed</option>
                <option value="in-content">In article</option>
                <option value="popup">Popup</option>
              </Select>
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as TypeFilter);
                  setPage(1);
                }}
                aria-label="Filter by type"
                className="w-full sm:w-auto"
              >
                <option value="all">All types</option>
                <option value="banner">Banner</option>
                <option value="text">Text</option>
                <option value="sponsored">Sponsored</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              href="/admin/ads/new"
              className={buttonClasses("primary", "md", "w-full sm:w-auto")}
            >
              <PlusIcon className="h-4 w-4" />
              New Ad
            </Link>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        {loading && ads.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">Loading advertisements…</p>
          </div>
        ) : error ? (
          <div className="px-4 py-8">
            <Alert tone="error" title="Couldn't load advertisements">
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
        ) : ads.length === 0 ? (
          <div className="px-4 py-10">
            <EmptyState
              icon={<AdIcon className="h-6 w-6" />}
              title={
                hasActiveFilters
                  ? "No advertisements match your filters."
                  : "No advertisements yet."
              }
              description={
                hasActiveFilters
                  ? "Try clearing the filters to see all advertisements."
                  : "Create your first advertisement from the database."
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
              {ads.map((ad) => (
                <li key={ad.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {ad.image ? (
                      <div className="relative aspect-[5/2] w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
                        <Image
                          src={ad.image.url}
                          alt={ad.image.alt ?? ad.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[5/2] w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        {ad.type === "text" ? "Text" : "No image"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-ink-900">
                        {ad.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        /{ad.slug}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {ad.active ? (
                          <Badge tone="green" dot>Active</Badge>
                        ) : (
                          <Badge tone="gray">Inactive</Badge>
                        )}
                        <Badge tone="gray">{adTypeLabel(ad.type)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex max-w-full flex-wrap gap-1">
                    {ad.placements.map((slot) => (
                      <Badge key={slot} tone="gray" className="!px-1.5 !py-0.5">
                        {adPositionLabel(slot)}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500">
                    <span className="truncate">
                      {formatDateOnly(ad.startDate)}
                      {" → "}
                      {formatDateOnly(ad.endDate)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href={`/admin/ads/${ad.id}/edit`}
                      aria-label={`Edit ${ad.name}`}
                      className={buttonClasses("outline", "sm", "w-full")}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleting(ad);
                      }}
                      aria-label={`Delete ${ad.name}`}
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
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Placement</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">End</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ads.map((ad) => (
                    <tr
                      key={ad.id}
                      className="transition-colors hover:bg-gray-50/70"
                    >
                      <td className="px-4 py-3">
                        {ad.image ? (
                          <div className="relative aspect-[5/2] w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
                            <Image
                              src={ad.image.url}
                              alt={ad.image.alt ?? ad.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-[5/2] w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            {ad.type === "text" ? "Text" : "No image"}
                          </div>
                        )}
                      </td>
                      <td className="max-w-[260px] px-4 py-3">
                        <p className="line-clamp-2 font-semibold text-ink-900">
                          {ad.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          /{ad.slug}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex max-w-[180px] flex-wrap gap-1">
                          {ad.placements.map((slot) => (
                            <Badge
                              key={slot}
                              tone="gray"
                              className="!px-1.5 !py-0.5"
                            >
                              {adPositionLabel(slot)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {adTypeLabel(ad.type)}
                      </td>
                      <td className="px-4 py-3">
                        {ad.active ? (
                          <Badge tone="green" dot>Active</Badge>
                        ) : (
                          <Badge tone="gray">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDateOnly(ad.startDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDateOnly(ad.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/admin/ads/${ad.id}/edit`}
                            aria-label={`Edit ${ad.name}`}
                            className={buttonClasses("outline", "sm")}
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleting(ad);
                            }}
                            aria-label={`Delete ${ad.name}`}
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
                itemLabel="ads"
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete advertisement?"
        description={`"${deleting?.name ?? ""}" will be permanently deleted from the database, along with its placements. This cannot be undone.`}
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