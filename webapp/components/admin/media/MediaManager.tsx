"use client";

import { useEffect, useMemo, useState } from "react";
import type { CmsMedia } from "@/lib/admin-media";
import { MediaIcon, PlusIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Button } from "@/components/admin/ui/Button";
import { SearchInput, Select } from "@/components/admin/ui/inputs";
import { Alert } from "@/components/admin/ui/Alert";
import { Modal } from "@/components/admin/ui/Modal";
import { Pagination } from "@/components/admin/ui/Pagination";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import MediaGridItem from "./MediaGridItem";
import MediaPreviewModal from "./MediaPreviewModal";
import MediaUploadModal from "./MediaUploadModal";
import { removeStoredMediaById, seedStoredMedia, upsertStoredMedia, useStoredMedia } from "./storage";

const PAGE_SIZE = 12;
type TypeFilter = "all" | "image" | "video";

export default function MediaManager({ seeds }: { seeds: CmsMedia[] }) {
  const stored = useStoredMedia();
  const media = stored ?? seeds;
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<CmsMedia | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<CmsMedia | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    seedStoredMedia(seeds);
  }, [seeds]);

  const hasActiveFilters = query.trim() !== "" || type !== "all";

  const resetFilters = () => {
    setQuery("");
    setType("all");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return media.filter((item) => {
      const matchesQuery =
        q === "" ||
        item.filename.toLowerCase().includes(q) ||
        item.alt.toLowerCase().includes(q);
      const matchesType = type === "all" || item.type === type;
      return matchesQuery && matchesType;
    });
  }, [media, query, type]);

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
    removeStoredMediaById(deleting.id);
    setNotice(`"${deleting.filename}" deleted from this browser (demo).`);
    setDeleting(null);
  };

  const handleCreated = (created: CmsMedia) => {
    upsertStoredMedia(created);
    setUploading(false);
    setNotice(`"${created.filename}" added to this browser's library (demo).`);
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
            placeholder="Search filename or alt text…"
            className="w-full lg:max-w-xs lg:flex-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value as TypeFilter);
                setPage(1);
              }}
              aria-label="Filter by media type"
              className="w-auto"
            >
              <option value="all">All types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </Select>
            {hasActiveFilters && (
              <Button variant="outline" size="md" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
            <Button variant="primary" onClick={() => setUploading(true)}>
              <PlusIcon className="h-4 w-4" />
              Upload Media
            </Button>
          </div>
        </div>
      </Card>

      {pageItems.length === 0 ? (
        <EmptyState
          icon={<MediaIcon className="h-6 w-6" />}
          title={hasActiveFilters ? "No media match your filters." : "No media in the library yet."}
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((item) => (
            <MediaGridItem
              key={item.id}
              media={item}
              onPreview={setViewing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Card>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          from={from}
          to={to}
          total={filtered.length}
          itemLabel="media files"
          onPageChange={setPage}
        />
      </Card>

      {viewing && <MediaPreviewModal media={viewing} onClose={() => setViewing(null)} />}

      {uploading && (
        <MediaUploadModal
          onCreated={handleCreated}
          onClose={() => setUploading(false)}
        />
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete media file?"
        description={`"${deleting?.filename ?? ""}" will be removed from this browser only (demo). This cannot be undone.`}
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