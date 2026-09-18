"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  categoryColor,
  categoryName,
  categoryOptions,
} from "@/lib/admin-articles";
import type { CategorySlug } from "@/lib/news";
import {
  createBlankCmsLiveStream,
  formatDateTime,
  liveStatusLabel,
  type CmsLiveStream,
} from "@/lib/admin-live";
import type { LiveStatus } from "@/lib/live";
import {
  CheckIcon,
  EyeIcon,
  LiveIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Field } from "@/components/admin/ui/Field";
import { Select, TextArea, TextInput } from "@/components/admin/ui/inputs";
import { Button } from "@/components/admin/ui/Button";
import { CategoryChip } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { Modal } from "@/components/admin/ui/Modal";
import {
  removeStoredLiveStream,
  seedStoredLiveStream,
  setStoredLiveStream,
  useStoredLiveStream,
} from "./storage";
import { cx } from "@/components/admin/ui/utils";

interface FormState {
  title: string;
  description: string;
  streamUrl: string;
  poster: string;
  category: CategorySlug;
  startedAt: string;
  viewers: string;
  status: LiveStatus;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function formFromStream(stream: CmsLiveStream): FormState {
  return {
    title: stream.title,
    description: stream.description,
    streamUrl: stream.streamUrl ?? "",
    poster: stream.poster,
    category: stream.category,
    startedAt: stream.startedAt,
    viewers: stream.viewers,
    status: stream.status,
  };
}

function toStreamInput(state: FormState): Omit<CmsLiveStream, "slug"> {
  return {
    title: state.title.trim(),
    description: state.description.trim(),
    streamUrl: state.streamUrl.trim() || null,
    poster: state.poster.trim(),
    category: state.category,
    startedAt: state.startedAt,
    viewers: state.viewers.trim(),
    status: state.status,
  };
}

function NoStreamState() {
  const [notice, setNotice] = useState<string | null>(null);

  const configure = () => {
    setStoredLiveStream(createBlankCmsLiveStream());
    setNotice(
      "A new stream draft was created. Fill in the details, then set it live.",
    );
  };

  return (
    <div className="space-y-4">
      {notice && (
        <Alert tone="success">{notice}</Alert>
      )}
      <Card className="py-14 sm:py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <LiveIcon className="h-7 w-7" />
          </span>
          <h2 className="text-lg font-bold tracking-tight text-ink-900">
            NO STREAM CONFIGURED
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-gray-500">
            There is no live stream set up right now. The public live page shows
            the no-stream state until you configure one.
          </p>
          <Button variant="primary" onClick={configure} className="mt-3">
            <PlusIcon className="h-4 w-4" />
            Configure a Stream
          </Button>
        </div>
      </Card>
    </div>
  );
}

function LiveEditor({
  stream,
  seed,
}: {
  stream: CmsLiveStream;
  seed: CmsLiveStream;
}) {
  const [form, setForm] = useState<FormState>(() => formFromStream(stream));
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (intent: LiveStatus): FormErrors => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (intent === "live" && !form.streamUrl.trim()) {
      next.streamUrl = "A stream URL is required to go live.";
    }
    return next;
  };

  const persist = (draft: FormState) => {
    seedStoredLiveStream(seed);
    const payload: CmsLiveStream = {
      slug: stream.slug,
      ...toStreamInput(draft),
    };
    setStoredLiveStream(payload);
  };

  const handleSave = () => {
    const nextErrors = validate(form.status);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    persist(form);
    setNotice("Changes saved. (Demo mode — stored in this browser.)");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSetLive = () => {
    const nextErrors = validate("live");
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    const draft = { ...form, status: "live" as const };
    setForm(draft);
    persist(draft);
    setNotice("Stream marked LIVE. (Demo mode — stored in this browser.)");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSetOffline = () => {
    const draft = { ...form, status: "offline" as const };
    setForm(draft);
    persist(draft);
    setNotice("Stream marked OFFLINE. (Demo mode — stored in this browser.)");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmClear = () => {
    removeStoredLiveStream();
  };

  const isLive = form.status === "live";
  const sourceUrl = form.streamUrl.trim();
  const canPlay = isLive && sourceUrl !== "";

  return (
    <div className="space-y-5">
      {notice && (
        <Alert tone="success" icon={<CheckIcon className="h-5 w-5" />}>
          {notice}
        </Alert>
      )}

      <Alert tone="info">
        Frontend-only demo: live stream configuration is stored in this browser
        only. A streaming backend will be connected later.
      </Alert>

      <Card padding={false} className="overflow-hidden">
        <div
          className={cx(
            "flex items-center gap-2 px-4 py-2.5",
            isLive ? "bg-brand" : "bg-gray-500",
          )}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={cx(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                isLive ? "bg-white" : "bg-white/60",
              )}
            />
            <span
              className={cx(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                isLive ? "bg-white" : "bg-white/90",
              )}
            />
          </span>
          <span className="text-sm font-extrabold uppercase tracking-wider text-white">
            {liveStatusLabel(form.status)}
          </span>
          {isLive && (
            <span className="ml-auto text-xs font-semibold text-white/90">
              Viewers: {form.viewers || "0"}
            </span>
          )}
        </div>

        {canPlay ? (
          <video
            controls
            playsInline
            autoPlay
            muted
            loop
            preload="metadata"
            poster={form.poster}
            className="aspect-video w-full bg-black"
          >
            <source src={sourceUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="relative aspect-video w-full">
            <Image
              src={form.poster}
              alt={form.title || "Live stream poster"}
              fill
              className="object-cover opacity-60"
              unoptimized
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900/70 text-white">
                <LiveIcon className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-white">
                {form.status === "offline"
                  ? "Off the air"
                  : "No video source yet — enter a stream URL"}
              </span>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip
              name={categoryName(form.category)}
              color={categoryColor(form.category)}
            />
            <span className="text-xs text-gray-400">/{stream.slug}</span>
          </div>
          <h2 className="mt-2 text-lg font-bold leading-snug tracking-tight text-ink-900">
            {form.title || "Untitled stream"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {form.description || "No description yet."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {form.status === "live" && (
              <span className="inline-flex items-center gap-1">
                <EyeIcon className="h-3.5 w-3.5 text-gray-400" />
                {form.viewers || "0"} viewers
              </span>
            )}
            <span>Started: {formatDateTime(form.startedAt)}</span>
          </div>
          {form.streamUrl && (
            <p className="mt-1 max-w-full truncate text-xs text-gray-400">
              Stream URL: {form.streamUrl}
            </p>
          )}
        </div>
      </Card>

      <Card className="space-y-6">
        <div className="space-y-5">
          <Field label="Title" required error={errors.title}>
            <TextInput
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Live broadcast title"
              error={!!errors.title}
            />
          </Field>

          <Field label="Description / Summary" required error={errors.description}>
            <TextArea
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="What viewers should know about this broadcast"
              error={!!errors.description}
            />
          </Field>

          <Field label="Stream URL" error={errors.streamUrl} hint=".m3u8 or direct video URL">
            <TextInput
              type="url"
              value={form.streamUrl}
              onChange={(e) => setField("streamUrl", e.target.value)}
              placeholder="https://example.com/stream.m3u8 or /video.mp4"
              error={!!errors.streamUrl}
            />
          </Field>

          <Field label="Poster / Thumbnail URL" hint="Recommended 1200×675">
            <TextInput
              type="url"
              value={form.poster}
              onChange={(e) => setField("poster", e.target.value)}
              placeholder="https://picsum.photos/seed/.../1200/675"
            />
          </Field>

          {form.poster && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
              <Image
                src={form.poster}
                alt="Poster preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Category" required>
              <Select
                value={form.category}
                onChange={(e) => setField("category", e.target.value as CategorySlug)}
              >
                {categoryOptions.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as LiveStatus)}
              >
                <option value="live">Live</option>
                <option value="offline">Offline</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Started at">
              <TextInput
                type="datetime-local"
                value={form.startedAt}
                onChange={(e) => setField("startedAt", e.target.value)}
              />
            </Field>

            <Field label="Viewers" hint="e.g. 18,250">
              <TextInput
                type="text"
                value={form.viewers}
                onChange={(e) => setField("viewers", e.target.value)}
                placeholder="18,250"
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-gray-100 pt-5">
          <Button variant="secondary" onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="primary" onClick={handleSetLive}>
            Set Live
          </Button>
          <Button variant="outline" onClick={handleSetOffline}>
            Set Offline
          </Button>
          <Button variant="dangerOutline" onClick={() => setClearing(true)}>
            <TrashIcon className="h-4 w-4" />
            Clear / Remove Stream
          </Button>
        </div>
      </Card>

      <Modal
        open={clearing}
        onClose={() => setClearing(false)}
        title="Remove the live stream?"
        description="The stream configuration will be cleared in this browser only (demo), returning the admin to the no-stream state. This cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setClearing(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmClear}>
              Remove Stream
            </Button>
          </>
        }
      />
    </div>
  );
}

export default function LiveManager({ seed }: { seed: CmsLiveStream }) {
  const stored = useStoredLiveStream();

  useEffect(() => {
    seedStoredLiveStream(seed);
  }, [seed]);

  if (stored === undefined) {
    return (
      <Card className="py-10 text-center text-sm text-gray-500">
        Loading configured live stream…
      </Card>
    );
  }

  if (stored === null) {
    return <NoStreamState />;
  }

  return <LiveEditor key={stored.slug} stream={stored} seed={seed} />;
}