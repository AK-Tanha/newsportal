"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CmsMedia, MediaType } from "@/lib/admin-media";
import { createCmsMedia, filenameFromUrl, formatBytes } from "@/lib/admin-media";
import { isValidHttpUrl } from "@/lib/admin-ads";
import { LinkIcon, PlusIcon, UploadIcon } from "@/components/admin/icons";
import { Modal } from "@/components/admin/ui/Modal";
import { Field } from "@/components/admin/ui/Field";
import { TextInput } from "@/components/admin/ui/inputs";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { Badge } from "@/components/admin/ui/Badge";
import Dropzone from "@/components/admin/ui/Dropzone";
import { cx } from "@/components/admin/ui/utils";
import { saveMediaFile } from "./files";

type Tab = "upload" | "url";

const MAX_FILE_SIZE = 200 * 1024 * 1024;

const IMAGE_EXT = /\.(png|jpe?g|jfif|gif|webp|avif|svg|bmp)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|mkv|m4v|avi)$/i;

interface Form {
  url: string;
  filename: string;
  alt: string;
  width: string;
  height: string;
}

const initialForm: Form = { url: "", filename: "", alt: "", width: "", height: "" };

function detectMediaType(file: File): MediaType | null {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (IMAGE_EXT.test(file.name)) return "image";
  if (VIDEO_EXT.test(file.name)) return "video";
  return null;
}

function getFileDimensions(
  file: File,
  type: MediaType,
  objectUrl: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (type === "image") {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth || 0, height: img.naturalHeight || 0 });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = objectUrl;
      return;
    }
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      resolve({
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      });
    video.onerror = () => resolve({ width: 0, height: 0 });
    video.src = objectUrl;
  });
}

export default function MediaUploadModal({
  onCreated,
  onClose,
}: {
  onCreated: (media: CmsMedia) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<MediaType | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>(
    { width: 0, height: 0 },
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>(initialForm);
  const [errors, setErrors] = useState<Partial<Form>>({});
  const objectUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const previewUrlFromForm =
    form.url.trim() && isValidHttpUrl(form.url.trim()) ? form.url.trim() : "";

  const setField = (field: keyof Form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const clearFile = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setFile(null);
    setPreviewUrl(null);
    setDetectedType(null);
    setDimensions({ width: 0, height: 0 });
    setUploadError(null);
    setUploadNotice(null);
  };

  const handleFile = async (selected: File) => {
    const type = detectMediaType(selected);
    if (!type) {
      setUploadError(
        "Unsupported file type. Choose an image (PNG, JPG, WEBP, GIF) or a video (MP4, WebM, MOV).",
      );
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setUploadError(
        `"${selected.name}" is ${formatBytes(selected.size)} — the demo limit is ${formatBytes(MAX_FILE_SIZE)}.`,
      );
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(selected);
    objectUrlRef.current = objectUrl;

    setUploadError(null);
    setUploadNotice(null);
    setFile(selected);
    setPreviewUrl(objectUrl);
    setDetectedType(type);
    setForm((prev) => ({ ...prev, filename: selected.name }));
    setDimensions(await getFileDimensions(selected, type, objectUrl));
  };

  const submitUrl = () => {
    const next: Partial<Form> = {};
    const url = form.url.trim();
    if (!url) {
      next.url = "An image/video URL is required.";
    } else if (!isValidHttpUrl(url)) {
      next.url = "Enter a valid http(s) URL.";
    }
    if (form.width && (Number(form.width) <= 0 || Number.isNaN(Number(form.width)))) {
      next.width = "Width must be a positive number.";
    }
    if (form.height && (Number(form.height) <= 0 || Number.isNaN(Number(form.height)))) {
      next.height = "Height must be a positive number.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const width = form.width ? Number(form.width) : undefined;
    const height = form.height ? Number(form.height) : undefined;
    onCreated(
      createCmsMedia({
        url,
        filename: form.filename.trim() || undefined,
        alt: form.alt,
        width,
        height,
      }),
    );
  };

  const submitUpload = async () => {
    if (!file || !detectedType || saving) return;
    setSaving(true);
    setUploadError(null);
    const id = `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      await saveMediaFile(id, file);
      const width =
        dimensions.width || (detectedType === "video" ? 1280 : 1200);
      const height =
        dimensions.height || (detectedType === "video" ? 720 : 800);
      onCreated(
        createCmsMedia({
          url: `local://${id}`,
          filename: form.filename.trim() || file.name,
          alt: form.alt,
          width,
          height,
          type: detectedType,
          size: formatBytes(file.size),
          localFile: true,
        }),
      );
    } catch {
      setUploadNotice(
        "Couldn't store this file in the browser. Private browsing or storage limits can block it — try a smaller file.",
      );
      setSaving(false);
    }
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setErrors({});
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Upload media"
      width="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {tab === "upload" ? (
            <Button
              variant="primary"
              onClick={submitUpload}
              disabled={!file || saving}
            >
              <PlusIcon className="h-4 w-4" />
              {saving ? "Adding…" : "Add to library"}
            </Button>
          ) : (
            <Button variant="primary" onClick={submitUrl}>
              <PlusIcon className="h-4 w-4" />
              Add to library
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <Alert tone="warning">
          Images and videos you upload here are stored locally in this browser
          (IndexedDB) for the demo. A real storage service is connected later.
        </Alert>

        <div
          role="tablist"
          aria-label="Upload source"
          className="flex items-center gap-1 rounded-lg bg-gray-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "upload"}
            onClick={() => switchTab("upload")}
            className={cx(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              tab === "upload"
                ? "bg-white text-ink-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800",
            )}
          >
            <UploadIcon className="h-4 w-4" />
            Upload file
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "url"}
            onClick={() => switchTab("url")}
            className={cx(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              tab === "url"
                ? "bg-white text-ink-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800",
            )}
          >
            <LinkIcon className="h-4 w-4" />
            Paste URL
          </button>
        </div>

        {tab === "upload" ? (
          <div className="space-y-4">
            <Dropzone
              accept="image/*,video/*"
              onSelect={handleFile}
              maxSize={MAX_FILE_SIZE}
              icon={<UploadIcon className="h-5 w-5" />}
              title={
                file
                  ? `Ready to add: ${file.name}`
                  : "Drag & drop an image or video here"
              }
              hint={
                file
                  ? "Drop another file to replace it"
                  : "or click to browse — PNG, JPG, WEBP, GIF, MP4, WebM, MOV"
              }
            />

            {detectedType && previewUrl && file && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-gray-700">Preview</p>
                  <div className="flex items-center gap-2">
                    <Badge tone={detectedType === "video" ? "violet" : "brand"}>
                      {detectedType === "video" ? "Video" : "Image"}
                    </Badge>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-xs font-medium text-gray-400 transition-colors hover:text-brand"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                {detectedType === "video" ? (
                  <video
                    src={previewUrl}
                    controls
                    muted
                    className="max-h-44 w-full rounded-lg border border-gray-200 bg-gray-950"
                  />
                ) : (
                  <NextImage
                    src={previewUrl}
                    alt="Uploaded media preview"
                    width={dimensions.width || 1200}
                    height={dimensions.height || 800}
                    unoptimized
                    className="max-h-44 w-full rounded-lg border border-gray-100 object-cover"
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>File size</span>
                  <span className="text-gray-300">·</span>
                  <span>{file ? formatBytes(file.size) : "—"}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>Dimensions</span>
                  <span className="text-gray-300">·</span>
                  <span>
                    {file
                      ? dimensions.width && dimensions.height
                        ? `${dimensions.width} × ${dimensions.height} px`
                        : "detecting…"
                      : "—"}
                  </span>
                </div>
              </div>
              <Field label="Filename">
                <TextInput
                  type="text"
                  value={form.filename}
                  onChange={(e) => setField("filename", e.target.value)}
                  placeholder={file ? file.name : "my-media-file"}
                />
              </Field>
            </div>

            <Field label="Alt text" hint="Screen-reader description (images only)">
              <TextInput
                type="text"
                value={form.alt}
                onChange={(e) => setField("alt", e.target.value)}
                placeholder="Describe the image"
              />
            </Field>

            {uploadError && <Alert tone="error">{uploadError}</Alert>}
            {uploadNotice && <Alert tone="error">{uploadNotice}</Alert>}
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Image or video URL" required error={errors.url}>
              <TextInput
                type="url"
                value={form.url}
                onChange={(e) => setField("url", e.target.value)}
                placeholder="https://example.com/media/photo.jpg"
                error={!!errors.url}
              />
            </Field>

            {previewUrlFromForm && (
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-gray-700">Preview</p>
                <NextImage
                  src={previewUrlFromForm}
                  alt="Uploaded media preview"
                  width={1200}
                  height={800}
                  unoptimized
                  className="max-h-44 w-full rounded-lg border border-gray-100 object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Filename"
                hint={`Defaults to ${previewUrlFromForm ? filenameFromUrl(previewUrlFromForm) : "media-file"}`}
              >
                <TextInput
                  type="text"
                  value={form.filename}
                  onChange={(e) => setField("filename", e.target.value)}
                  placeholder={
                    previewUrlFromForm ? filenameFromUrl(previewUrlFromForm) : "media-file"
                  }
                />
              </Field>
              <Field label="Alt text" hint="Screen-reader description">
                <TextInput
                  type="text"
                  value={form.alt}
                  onChange={(e) => setField("alt", e.target.value)}
                  placeholder="Describe the image"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Width px" error={errors.width}>
                <TextInput
                  type="number"
                  min={1}
                  value={form.width}
                  onChange={(e) => setField("width", e.target.value)}
                  placeholder="1200"
                  error={!!errors.width}
                />
              </Field>
              <Field label="Height px" error={errors.height}>
                <TextInput
                  type="number"
                  min={1}
                  value={form.height}
                  onChange={(e) => setField("height", e.target.value)}
                  placeholder="800"
                  error={!!errors.height}
                />
              </Field>
            </div>

            <p className="text-xs text-gray-400">
              Dimensions and file size come from the URL — enter them manually if
              you know them, or upload the file for automatic detection.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}