"use client";

import Image from "next/image";
import type { CmsMedia } from "@/lib/admin-media";
import { EyeIcon, TrashIcon, VideoIcon } from "@/components/admin/icons";
import { buttonClasses } from "@/components/admin/ui/Button";
import { useMediaSrc } from "./hooks";

export default function MediaGridItem({
  media,
  onPreview,
  onDelete,
}: {
  media: CmsMedia;
  onPreview: (media: CmsMedia) => void;
  onDelete: (media: CmsMedia) => void;
}) {
  const src = useMediaSrc(media);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => onPreview(media)}
        aria-label={`Preview ${media.filename}`}
        className="relative block aspect-video w-full overflow-hidden bg-gray-100"
      >
        {media.type === "image" ? (
          <Image
            src={src}
            alt={media.alt || media.filename}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center gap-2 text-white/80">
              <VideoIcon className="h-8 w-8" />
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Video
              </span>
            </div>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {media.type}
        </span>
      </button>

      <div className="flex flex-col gap-1.5 p-3">
        <p
          className="truncate text-sm font-semibold text-ink-900"
          title={media.filename}
        >
          {media.filename}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            {media.width} × {media.height}
          </span>
          <span aria-hidden>·</span>
          <span>{media.size}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPreview(media)}
            className={buttonClasses("outline", "sm")}
          >
            <EyeIcon className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            onClick={() => onDelete(media)}
            aria-label={`Delete ${media.filename}`}
            className={buttonClasses("dangerOutline", "sm")}
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}