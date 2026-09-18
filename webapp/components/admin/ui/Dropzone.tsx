"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "./utils";

export function matchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  return rules.some((rule) => {
    if (rule === "*/*") return true;
    if (rule.endsWith("/*")) {
      return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    }
    if (rule.startsWith(".")) {
      return file.name.toLowerCase().endsWith(rule);
    }
    return file.type.toLowerCase() === rule;
  });
}

function formatLimit(bytes: number): string {
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

interface DropzoneProps {
  accept: string;
  onSelect: (file: File) => void;
  title?: string;
  hint?: string;
  icon?: ReactNode;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export default function Dropzone({
  accept,
  onSelect,
  title = "Drag & drop your file here",
  hint = "or click to browse from your device",
  icon,
  maxSize,
  disabled = false,
  className,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!matchesAccept(file, accept)) {
      setRejected("This file type isn't supported here.");
      return;
    }
    if (maxSize && file.size > maxSize) {
      setRejected(`File is too large — max ${formatLimit(maxSize)}.`);
      return;
    }
    setRejected(null);
    onSelect(file);
  };

  return (
    <label
      className={cx(
        "group flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition-colors",
        dragging
          ? "border-brand bg-brand/5"
          : "border-gray-300 hover:border-brand/50 hover:bg-gray-50",
        "focus-within:ring-2 focus-within:ring-brand/30 focus-within:ring-offset-2",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <span
        className={cx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
          dragging ? "bg-brand text-white" : "bg-brand/10 text-brand",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold text-ink-900">{title}</span>
      {rejected ? (
        <span className="text-xs font-medium text-red-600">{rejected}</span>
      ) : (
        <span className="text-xs text-gray-500">{hint}</span>
      )}
    </label>
  );
}