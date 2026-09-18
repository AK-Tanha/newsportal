"use client";

import Image from "next/image";
import { useState } from "react";
import type { CmsMedia } from "@/lib/admin-media";
import { formatDate, formatDimensions } from "@/lib/admin-media";
import {
  CheckIcon,
  ExternalLinkIcon,
  VideoIcon,
} from "@/components/admin/icons";
import { Modal } from "@/components/admin/ui/Modal";
import { Alert } from "@/components/admin/ui/Alert";
import { buttonClasses } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/utils";
import { useMediaSrc } from "./hooks";

export default function MediaPreviewModal({
  media,
  onClose,
}: {
  media: CmsMedia;
  onClose: () => void;
}) {
  const src = useMediaSrc(media);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 1600);
  };

  return (
    <Modal open onClose={onClose} title={media.filename} width="lg">
      <div className="flex flex-col gap-4">
        <div className="flex max-h-80 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
          {media.type === "image" ? (
            <Image
              src={src}
              alt={media.alt || media.filename}
              width={media.width}
              height={media.height}
              unoptimized
              className="max-h-80 w-auto rounded object-contain"
            />
          ) : (
            <div className="w-full">
              <video
                src={src}
                controls
                className="max-h-80 w-full rounded bg-black"
              />
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Detail label="Filename" value={media.filename} />
          <Detail label="Media type" value={media.type === "image" ? "Image" : "Video"} />
          <Detail
            label="Dimensions"
            value={formatDimensions(media.width, media.height)}
          />
          <Detail label="File size" value={media.size} />
          <Detail label="Created" value={formatDate(media.createdAt)} />
          <Detail
            label="Alt text"
            value={media.alt || "—"}
            span
          />
          <div className="col-span-2">
            {media.localFile ? (
              <Alert tone="info">
                This file was uploaded from your device and is stored only in
                this browser (IndexedDB) as part of the demo. It doesn&apos;t have a
                public URL yet — a storage backend will be connected later.
              </Alert>
            ) : (
              <>
                <p className="text-[13px] font-medium text-gray-700">URL</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    readOnly
                    value={media.url}
                    className="w-full truncate rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs text-ink-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyUrl}
                    aria-label="Copy URL"
                    className={buttonClasses("outline", "sm", "shrink-0")}
                  >
                    {copyState === "copied" ? (
                      <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    )}
                    {copyState === "copied"
                      ? "Copied"
                      : copyState === "failed"
                        ? "Copy failed"
                        : "Copy URL"}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <VideoIcon className="h-3.5 w-3.5" />
                  {media.type === "image" ? "Image" : "Video"} file referenced at this URL
                  {media.type === "video" && " (streams in the public video player)"}
                </div>
              </>
            )}
          </div>
        </dl>
      </div>
    </Modal>
  );
}

function Detail({
  label,
  value,
  span = false,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div className={cx(span && "col-span-2")}>
      <p className="text-[13px] font-medium text-gray-700">{label}</p>
      <p className="mt-0.5 break-words text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}