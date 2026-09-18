"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPublishedDate } from "@/lib/admin-articles";
import {
  adPositionLabel,
  adTypeLabel,
  type CmsAd,
} from "@/lib/admin-ads";
import type { AdPlacement } from "@/lib/ads";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { SearchInput, Select } from "@/components/admin/ui/inputs";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { Modal } from "@/components/admin/ui/Modal";
import { Pagination } from "@/components/admin/ui/Pagination";
import { removeStoredAdById, seedStoredAds, useStoredAds } from "./storage";

const PAGE_SIZE = 8;
type PositionFilter = "all" | AdPlacement;
type StatusFilter = "all" | "active" | "inactive";

export default function AdsManager({ seeds }: { seeds: CmsAd[] }) {
  const stored = useStoredAds();
  const ads = stored ?? seeds;
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<PositionFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<CmsAd | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    seedStoredAds(seeds);
  }, [seeds]);

  const hasActiveFilters =
    query.trim() !== "" || position !== "all" || status !== "all";

  const resetFilters = () => {
    setQuery("");
    setPosition("all");
    setStatus("all");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ads.filter((ad) => {
      const matchesQuery =
        q === "" ||
        ad.name.toLowerCase().includes(q) ||
        ad.description.toLowerCase().includes(q) ||
        ad.targetUrl.toLowerCase().includes(q) ||
        ad.slug.toLowerCase().includes(q);
      const matchesPosition =
        position === "all" || ad.positions.includes(position);
      const matchesStatus =
        status === "all" ||
        (status === "active" ? ad.active : !ad.active);
      return matchesQuery && matchesPosition && matchesStatus;
    });
  }, [ads, query, position, status]);

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
    removeStoredAdById(deleting.id);
    setNotice(`"${deleting.name}" deleted from this browser (demo).`);
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
            placeholder="Search name, description, URL…"
            className="w-full lg:max-w-xs lg:flex-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Select
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value as PositionFilter);
                  setPage(1);
                }}
                aria-label="Filter by position"
                className="w-auto"
              >
                <option value="all">All positions</option>
                <option value="header">Top header</option>
                <option value="below-hero">Below hero</option>
                <option value="sidebar">Sidebar</option>
                <option value="in-feed">In feed</option>
                <option value="in-content">In article</option>
                <option value="popup">Popup</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="md" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
            <Link
              href="/admin/ads/new"
              className={buttonClasses("primary", "md")}
            >
              <PlusIcon className="h-4 w-4" />
              New Ad
            </Link>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No ads match your filters.
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
              {pageItems.map((ad) => (
                <tr key={ad.id} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-3">
                    {ad.image ? (
                      <div className="relative aspect-[5/2] w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
                        <Image
                          src={ad.image}
                          alt={ad.name}
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
                    <p className="mt-0.5 text-xs text-gray-400">/{ad.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-[180px] flex-wrap gap-1">
                      {ad.positions.map((placement) => (
                        <Badge key={placement} tone="gray" className="!px-1.5 !py-0.5">
                          {adPositionLabel(placement)}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{adTypeLabel(ad.type)}</td>
                  <td className="px-4 py-3">
                    {ad.active ? (
                      <Badge tone="green" dot>Active</Badge>
                    ) : (
                      <Badge tone="gray">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatPublishedDate(ad.startDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatPublishedDate(ad.endDate)}
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
                        onClick={() => setDeleting(ad)}
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
            total={filtered.length}
            itemLabel="ads"
            onPageChange={setPage}
          />
        </div>
      </Card>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete advertisement?"
        description={`"${deleting?.name ?? ""}" will be removed from this browser only (demo). This cannot be undone.`}
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