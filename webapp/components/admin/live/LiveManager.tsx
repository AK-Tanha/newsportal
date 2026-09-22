"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  categoryColor,
  categoryName,
  categoryOptions,
} from "@/lib/admin-articles";
import type { CategorySlug } from "@/lib/news";
import { liveStatusLabel } from "@/lib/admin-live";
import type { LiveStatus } from "@/lib/live";
import { NO_ACTIVE_STREAM } from "@/lib/server/live/live-types";
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
  liveApi,
  ApiRequestError,
  type CreateLiveInput,
  type LiveDetailDto,
} from "./api";
import { cx } from "@/components/admin/ui/utils";

interface FormState {
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  streamUrl: string;
  poster: string;
  category: CategorySlug;
  startedAt: string;
  viewerCount: string;
  status: LiveStatus;
  active: boolean;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function formFromDetail(detail: LiveDetailDto): FormState {
  const localized = detail.localized ?? {};
  return {
    titleBn: localized.bn?.title ?? detail.title,
    titleEn: localized.en?.title ?? detail.title,
    descriptionBn: localized.bn?.description ?? "",
    descriptionEn: localized.en?.description ?? "",
    streamUrl: detail.streamUrl ?? "",
    poster: detail.poster?.url ?? "",
    category: (detail.category?.slug as CategorySlug) ?? "national",
    startedAt: detail.startedAt ?? "",
    viewerCount: detail.viewerCount ? String(detail.viewerCount) : "0",
    status: detail.status,
    active: detail.active ?? false,
  };
}

function buildPayload(state: FormState): CreateLiveInput {
  return {
    slug: "",
    category: state.category,
    posterMediaId: null,
    title: {
      bn: state.titleBn.trim(),
      en: state.titleEn.trim(),
    },
    description: {
      bn: state.descriptionBn.trim(),
      en: state.descriptionEn.trim(),
    },
    streamUrl: state.streamUrl.trim() || null,
    status: state.status,
    active: state.active,
    startedAt: state.startedAt || null,
    viewerCount: Number(state.viewerCount) || 0,
  };
}

function NoStreamState() {
  return (
    <div className="space-y-4">
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
        </div>
      </Card>
    </div>
  );
}

function LiveEditor({ stream }: { stream: LiveDetailDto }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => formFromDetail(stream));
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.titleBn.trim()) next.titleBn = "Bengali title is required.";
    if (!form.titleEn.trim()) next.titleEn = "English title is required.";
    if (!form.descriptionBn.trim()) next.descriptionBn = "Bengali description is required.";
    if (!form.descriptionEn.trim()) next.descriptionEn = "English description is required.";
    if (form.status === "live" && !form.streamUrl.trim()) {
      next.streamUrl = "A stream URL is required to go live.";
    }
    return next;
  };

  const applyErrors = (error: unknown) => {
    if (error instanceof ApiRequestError && error.details) {
      const next: FormErrors = {};
      for (const detail of error.details) {
        if (detail.issues.length > 0) next[detail.field as keyof FormState] = detail.issues[0];
      }
      setErrors(next);
    }
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setSaving(true);
    try {
      const input = buildPayload(form);
      if (stream.id) {
        const saved = await liveApi.update(stream.id, {
          category: input.category,
          title: input.title,
          description: input.description,
          streamUrl: input.streamUrl,
          status: input.status,
          active: input.active,
          startedAt: input.startedAt,
          viewerCount: input.viewerCount,
        });
        setForm(formFromDetail(saved));
      } else {
        const created = await liveApi.create(input);
        router.push(`/admin/live`);
        setForm(formFromDetail(created));
      }
      setNotice("Changes saved.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      applyErrors(error);
      setNotice(null);
    } finally {
      setSaving(false);
    }
  };

  const handleSetLive = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setSaving(true);
    try {
      const draft = { ...form, status: "live" as const, active: true };
      setForm(draft);
      const input = buildPayload(draft);
      if (stream.id) {
        const saved = await liveApi.update(stream.id, {
          status: "live",
          active: true,
          startedAt: input.startedAt,
          streamUrl: input.streamUrl,
        });
        setForm(formFromDetail(saved));
      }
      setNotice("Stream marked LIVE.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      applyErrors(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSetOffline = async () => {
    setSaving(true);
    try {
      const draft = { ...form, status: "offline" as const, active: false };
      setForm(draft);
      if (stream.id) {
        const saved = await liveApi.update(stream.id, {
          status: "offline",
          active: false,
          streamUrl: null,
        });
        setForm(formFromDetail(saved));
      }
      setNotice("Stream marked OFFLINE.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      applyErrors(error);
    } finally {
      setSaving(false);
    }
  };

  const confirmClear = async () => {
    if (!stream.id) {
      router.push("/admin/live");
      return;
    }
    setSaving(true);
    try {
      await liveApi.remove(stream.id);
      router.push("/admin/live");
      router.refresh();
    } catch (error) {
      applyErrors(error);
      setClearing(false);
    } finally {
      setSaving(false);
    }
  };

  const isLive = form.status === "live";

  return (
    <div className="space-y-5">
      {notice && <Alert tone="success">{notice}</Alert>}

      <Card className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Title (Bengali)" required error={errors.titleBn}>
            <TextInput
              type="text"
              value={form.titleBn}
              onChange={(e) => setField("titleBn", e.target.value)}
              placeholder="Broadcast title (বাংলা)"
              error={!!errors.titleBn}
            />
          </Field>

          <Field label="Title (English)" required error={errors.titleEn}>
            <TextInput
              type="text"
              value={form.titleEn}
              onChange={(e) => setField("titleEn", e.target.value)}
              placeholder="Broadcast title (English)"
              error={!!errors.titleEn}
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Description (Bengali)" required error={errors.descriptionBn}>
            <TextArea
              rows={3}
              value={form.descriptionBn}
              onChange={(e) => setField("descriptionBn", e.target.value)}
              placeholder="What viewers should know (বাংলা)"
              error={!!errors.descriptionBn}
            />
          </Field>

          <Field label="Description (English)" required error={errors.descriptionEn}>
            <TextArea
              rows={3}
              value={form.descriptionEn}
              onChange={(e) => setField("descriptionEn", e.target.value)}
              placeholder="What viewers should know (English)"
              error={!!errors.descriptionEn}
            />
          </Field>
        </div>

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

          <Field label="Viewer count" hint="Numeric value">
            <TextInput
              type="text"
              value={form.viewerCount}
              onChange={(e) => setField("viewerCount", e.target.value)}
              placeholder="18250"
            />
          </Field>
        </div>
      </Card>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
        <Button
          variant="secondary"
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          Save Changes
        </Button>
        <Button
          variant="primary"
          onClick={handleSetLive}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          Set Live
        </Button>
        <Button
          variant="outline"
          onClick={handleSetOffline}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          Set Offline
        </Button>
        <Button
          variant="dangerOutline"
          onClick={() => setClearing(true)}
          className="w-full sm:w-auto"
        >
          <TrashIcon className="h-4 w-4" />
          Clear / Remove Stream
        </Button>
      </div>

      <Modal
        open={clearing}
        onClose={() => setClearing(false)}
        title="Remove the live stream?"
        description="The stream configuration will be removed from the database. This cannot be undone."
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

export default function LiveManager() {
  const [stream, setStream] = useState<LiveDetailDto | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await liveApi.active();
        if (cancelled) return;
        if (result.data === null) {
          setStream(null);
        } else {
          setStream(result.data);
        }
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof ApiRequestError ? error.message : "Failed to load.");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return <Alert tone="error">{loadError}</Alert>;
  }

  if (stream === undefined) {
    return (
      <Card className="py-10 text-center text-sm text-gray-500">
        Loading configured live stream…
      </Card>
    );
  }

  if (stream === null) {
    return <NoStreamState />;
  }

  return <LiveEditor stream={stream} />;
}
