"use client";

import { useState } from "react";
import { LinkIcon, UploadIcon, CloseIcon } from "@/components/admin/icons";
import { Field } from "./Field";
import { TextInput } from "./inputs";
import Dropzone, { matchesAccept } from "./Dropzone";
import { cx } from "./utils";

export type MediaFileType = "image" | "video";

interface MediaUrlFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  fileType: MediaFileType;
  maxFileSize?: number;
  alwaysShowUpload?: boolean;
}

function formatLimit(bytes: number): string {
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export default function MediaUrlField({
  label,
  value,
  onChange,
  error,
  hint = "Paste a hosted URL, or upload a file — it's embedded and stored in this browser.",
  required,
  placeholder,
  fileType,
  maxFileSize,
  alwaysShowUpload = false,
}: MediaUrlFieldProps) {
  const [showUpload, setShowUpload] = useState(alwaysShowUpload);
  const [fileName, setFileName] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  const isEmbedded = value.startsWith("data:");
  const accept =
    fileType === "video" ? "video/*" : "image/*,image/heic,image/heif";

  const clear = () => {
    onChange("");
    setFileName(null);
    setReadError(null);
    if (!alwaysShowUpload) setShowUpload(false);
  };

  const handleFile = (file: File) => {
    setReadError(null);
    if (!matchesAccept(file, fileType === "video" ? "video/*" : "image/*")) {
      setReadError(`That file isn't a supported ${fileType}.`);
      return;
    }
    if (maxFileSize && file.size > maxFileSize) {
      setReadError(`File too large — the limit is ${formatLimit(maxFileSize)}.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
        setFileName(file.name);
        if (!alwaysShowUpload) setShowUpload(false);
      } else {
        setReadError("Couldn't read that file.");
      }
    };
    reader.onerror = () => setReadError("Couldn't read that file.");
    reader.readAsDataURL(file);
  };

  return (
    <Field label={label} required={required} error={error ?? readError ?? undefined} hint={hint}>
      <div className="space-y-2">
        {isEmbedded || fileName ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
              <UploadIcon className="h-3 w-3" />
              {fileType === "video" ? "Video" : "Image"} embedded
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">
              {fileName ?? "Uploaded file"}
            </span>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink-900"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <TextInput
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            error={!!(error || readError)}
          />
        )}

        {!alwaysShowUpload && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowUpload((v) => !v)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                showUpload
                  ? "bg-brand/10 text-brand"
                  : "text-gray-500 hover:bg-gray-100 hover:text-ink-900",
              )}
            >
              <UploadIcon className="h-3.5 w-3.5" />
              Upload from device
            </button>
            {showUpload && (
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink-900"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Use a URL instead
              </button>
            )}
          </div>
        )}

        {showUpload && (
          <Dropzone
            accept={accept}
            onSelect={handleFile}
            maxSize={maxFileSize}
            icon={<UploadIcon className="h-5 w-5" />}
            title={
              fileType === "image"
                ? "Drop an image file here"
                : "Drop a video file here"
            }
            hint="or click to browse from your device"
            className="px-6 py-8"
          />
        )}
      </div>
    </Field>
  );
}