"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  categoryName,
  categoryOptions,
  slugifyTitle,
} from "@/lib/admin-articles";
import type { CategorySlug } from "@/lib/news";
import type { Video } from "@/lib/videos";
import VideoPlayer from "@/components/VideoPlayer";
import {
  type CmsVideo,
  type CmsVideoStatus,
} from "@/lib/admin-videos";
import { CheckIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Field } from "@/components/admin/ui/Field";
import { Checkbox, Select, TextArea, TextInput } from "@/components/admin/ui/inputs";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import {
  seedStoredVideos,
  upsertStoredVideo,
  useStoredVideoById,
} from "./storage";

interface FormState {
  title: string;
  slug: string;
  summary: string;
  category: CategorySlug;
  videoUrl: string;
  image: string;
  duration: string;
  views: string;
  featured: boolean;
  publishedAt: string;
  status: CmsVideoStatus;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  title: "",
  slug: "",
  summary: "",
  category: "national",
  videoUrl: "",
  image: "",
  duration: "",
  views: "",
  featured: false,
  publishedAt: "",
  status: "draft",
};

function formFromVideo(video?: CmsVideo): FormState {
  if (!video) return initialFormState;
  return {
    title: video.title,
    slug: video.slug,
    summary: video.summary,
    category: video.category,
    videoUrl: video.videoUrl,
    image: video.image,
    duration: video.duration,
    views: video.views,
    featured: video.featured,
    publishedAt: video.publishedAt,
    status: video.status,
  };
}

function toVideoInput(state: FormState): Omit<CmsVideo, "id"> {
  return {
    slug: state.slug || slugifyTitle(state.title),
    title: state.title.trim(),
    summary: state.summary.trim(),
    category: state.category,
    videoUrl: state.videoUrl.trim(),
    image: state.image.trim(),
    duration: state.duration.trim(),
    views: state.views.trim(),
    featured: state.featured,
    publishedAt: state.publishedAt,
    status: state.status,
  };
}

function VideoFormFields({
  seeds,
  videoId,
  current,
}: {
  seeds: CmsVideo[];
  videoId?: string;
  current: CmsVideo | undefined;
}) {
  const [form, setForm] = useState<FormState>(() =>
    formFromVideo(current),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | undefined>(videoId);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const generateSlug = () => {
    if (!form.title.trim()) {
      setErrors((prev) => ({
        ...prev,
        title: "Enter a title first, then generate the slug.",
      }));
      return;
    }
    setField("slug", slugifyTitle(form.title));
  };

  const validate = (intent: "draft" | "publish"): FormErrors => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.summary.trim()) next.summary = "Summary is required.";
    if (!form.videoUrl.trim()) {
      next.videoUrl = "A video URL is required.";
    }
    const slug = form.slug.trim() || slugifyTitle(form.title);
    if (!slug) next.slug = "Could not derive a slug. Enter one manually.";
    if (intent === "publish" && !form.publishedAt) {
      next.publishedAt = "Published date is required to publish.";
    }
    return next;
  };

  const handleSave = (intent: "draft" | "publish") => {
    const nextErrors = validate(intent);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    seedStoredVideos(seeds);
    const status: CmsVideoStatus = intent === "publish" ? "published" : "draft";
    const id = createdId ?? (videoId ?? Date.now().toString());
    const video: CmsVideo = {
      id,
      ...toVideoInput({ ...form, status }),
    };
    upsertStoredVideo(video);
    if (!createdId) setCreatedId(id);
    setSavedNotice(
      `"${video.title}" saved as ${
        status === "published" ? "published" : "a draft"
      }. (Demo mode — stored in this browser.)`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previewVideo: Video | undefined = form.videoUrl.trim()
    ? {
        slug: form.slug || "preview",
        category: form.category,
        categoryName: categoryName(form.category),
        image: form.image.trim(),
        videoUrl: form.videoUrl.trim(),
        duration: form.duration || "—",
        views: form.views || "0",
        featured: form.featured,
        title: form.title || "Video preview",
        summary: form.summary,
        publishedAt: form.publishedAt || "—",
      }
    : undefined;

  return (
    <div className="space-y-5">
      {savedNotice && (
        <Alert tone="success" icon={<CheckIcon className="h-5 w-5" />}>
          {savedNotice}
        </Alert>
      )}

      <Alert tone="info">
        Frontend-only demo: changes are saved to this browser only. A database
        backend will be connected later.
      </Alert>

      <Card className="space-y-6">
        <div className="space-y-5">
          <Field label="Title" required error={errors.title}>
            <TextInput
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Video headline"
              error={!!errors.title}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Slug" error={errors.slug} hint="Auto-generated from title">
              <div className="flex gap-2">
                <TextInput
                  type="text"
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  placeholder="auto-generated from title"
                  error={!!errors.slug}
                />
                <Button variant="secondary" onClick={generateSlug} className="shrink-0">
                  Generate
                </Button>
              </div>
            </Field>

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
          </div>

          <Field label="Summary / Description" required error={errors.summary}>
            <TextArea
              rows={3}
              value={form.summary}
              onChange={(e) => setField("summary", e.target.value)}
              placeholder="Short description shown in listings"
              error={!!errors.summary}
            />
          </Field>

          <Field label="Video URL" required error={errors.videoUrl}>
            <TextInput
              type="url"
              value={form.videoUrl}
              onChange={(e) => setField("videoUrl", e.target.value)}
              placeholder="https://example.com/video.mp4"
              error={!!errors.videoUrl}
            />
          </Field>

          {previewVideo ? (
            <div>
              <p className="mb-2 text-[13px] font-medium text-gray-700">Preview</p>
              <VideoPlayer video={previewVideo} className="overflow-hidden rounded-lg border border-gray-200 ring-1 ring-inset ring-gray-900/5" />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-sm text-gray-400">
              Enter a video URL to see the player preview.
            </div>
          )}

          <Field label="Thumbnail / Poster URL" hint="Recommended 1200×675">
            <TextInput
              type="url"
              value={form.image}
              onChange={(e) => setField("image", e.target.value)}
              placeholder="https://picsum.photos/seed/.../1200/675"
            />
          </Field>

          {form.image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
              <Image
                src={form.image}
                alt="Thumbnail preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Duration" hint="e.g. 4:20">
              <TextInput
                type="text"
                value={form.duration}
                onChange={(e) => setField("duration", e.target.value)}
                placeholder="4:20"
              />
            </Field>

            <Field label="Views" hint="e.g. 28,700">
              <TextInput
                type="text"
                value={form.views}
                onChange={(e) => setField("views", e.target.value)}
                placeholder="28,700"
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as CmsVideoStatus)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>

            <Field label="Published date" error={errors.publishedAt}>
              <TextInput
                type="date"
                value={form.publishedAt}
                onChange={(e) => setField("publishedAt", e.target.value)}
                error={!!errors.publishedAt}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3.5">
            <Checkbox
              label="Featured"
              checked={form.featured}
              onChange={(e) => setField("featured", e.target.checked)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-gray-100 pt-5">
          <Button variant="secondary" onClick={() => handleSave("draft")}>
            Save Draft
          </Button>
          <Button variant="primary" onClick={() => handleSave("publish")}>
            Publish
          </Button>
          <Link
            href="/admin/videos"
            className={buttonClasses("outline", "md")}
          >
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function VideoForm({
  seeds,
  initial,
  videoId,
}: {
  seeds: CmsVideo[];
  initial?: CmsVideo;
  videoId?: string;
}) {
  const stored = useStoredVideoById(videoId ?? initial?.id);
  const current = stored ?? initial;

  return (
    <VideoFormFields
      key={current?.id ?? "new"}
      seeds={seeds}
      videoId={videoId ?? current?.id}
      current={current}
    />
  );
}