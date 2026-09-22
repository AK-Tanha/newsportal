"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  categoryName,
  categoryOptions,
  slugifyTitle,
} from "@/lib/admin-articles";
import type { CategorySlug } from "@/lib/news";
import type { Video } from "@/lib/videos";
import VideoPlayer from "@/components/VideoPlayer";
import { fetchCurrentUser, type CurrentUser } from "@/components/admin/articles/api";
import { CheckIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Field } from "@/components/admin/ui/Field";
import { Checkbox, Select, TextArea, TextInput } from "@/components/admin/ui/inputs";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { cx } from "@/components/admin/ui/utils";
import {
  ApiRequestError,
  videosApi,
  apiErrorMessage,
  fieldErrors,
  localizedFieldError,
  type CreateVideoInput,
  type UpdateVideoInput,
  type VideoDetailDto,
  type VideoLocale,
  type VideoStatus,
} from "./api";

interface LocaleFields {
  title: string;
  summary: string;
}

interface FormState {
  slug: string;
  category: string;
  authorId: string | null;
  videoUrl: string;
  durationSeconds: string;
  viewsCount: string;
  featured: boolean;
  publishedAt: string;
  status: VideoStatus;
  bn: LocaleFields;
  en: LocaleFields;
}

const LOCALES: VideoLocale[] = ["bn", "en"];

const emptyForm: FormState = {
  slug: "",
  category: "national",
  authorId: null,
  videoUrl: "",
  durationSeconds: "",
  viewsCount: "",
  featured: false,
  publishedAt: "",
  status: "draft",
  bn: { title: "", summary: "" },
  en: { title: "", summary: "" },
};

function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formFromDetail(detail: VideoDetailDto): FormState {
  return {
    slug: detail.slug,
    category: detail.category.slug,
    authorId: detail.author?.id ?? null,
    videoUrl: detail.videoUrl,
    durationSeconds:
      detail.durationSeconds > 0 ? String(detail.durationSeconds) : "",
    viewsCount: String(detail.viewsCount),
    featured: detail.featured,
    publishedAt: toDateTimeLocal(detail.publishedAt),
    status: detail.status,
    bn: {
      title: detail.localized.bn?.title ?? "",
      summary: detail.localized.bn?.summary ?? "",
    },
    en: {
      title: detail.localized.en?.title ?? "",
      summary: detail.localized.en?.summary ?? "",
    },
  };
}

/** Parses a non-negative integer, treating blanks as "not set". */
function parseCounter(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const number = Number(trimmed);
  return Number.isInteger(number) && number >= 0 ? number : undefined;
}

function formatDurationSeconds(seconds: number): string {
  if (seconds <= 0) return "—";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes >= 60
    ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${minutes}:${String(rest).padStart(2, "0")}`;
}

export default function VideoForm({ videoId }: { videoId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(videoId);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [locale, setLocale] = useState<VideoLocale>("bn");
  const [loading, setLoading] = useState(Boolean(videoId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionUser, setSessionUser] = useState<CurrentUser | null>(null);
  const [loadedAuthor, setLoadedAuthor] = useState<{ id: string; name: string } | null>(null);
  const [detail, setDetail] = useState<VideoDetailDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser()
      .then((user) => {
        if (cancelled) return;
        setSessionUser(user);
        if (!videoId) {
          setForm((prev) => ({ ...prev, authorId: user.id }));
        }
      })
      .catch(() => {});

    if (videoId) {
      videosApi
        .get(videoId)
        .then((result) => {
          if (cancelled) return;
          setDetail(result);
          setLoadedAuthor(result.author);
          setForm(formFromDetail(result));
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setLoadError(apiErrorMessage(err));
          setLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const authorOptions = useMemo(() => {
    const options = new Map<string, { id: string; name: string }>();
    if (sessionUser) {
      options.set(sessionUser.id, { id: sessionUser.id, name: sessionUser.fullName });
    }
    if (loadedAuthor) {
      options.set(loadedAuthor.id, loadedAuthor);
    }
    return Array.from(options.values());
  }, [sessionUser, loadedAuthor]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next[`content.${key}`];
      return next;
    });
  };

  const setLocaleField = (field: keyof LocaleFields, value: string) => {
    setForm((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${field}.${locale}`];
      return next;
    });
  };

  const generateSlug = () => {
    const source = form.en.title.trim() || form.bn.title.trim();
    if (!source) {
      setErrors((prev) => ({
        ...prev,
        slug: "Enter a title first, then generate the slug.",
      }));
      return;
    }
    const slug = slugifyTitle(source);
    if (!slug) {
      setErrors((prev) => ({
        ...prev,
        slug: "Could not derive a slug from that title. Enter one manually.",
      }));
      return;
    }
    setField("slug", slug);
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    for (const loc of LOCALES) {
      const fields = form[loc];
      if (!fields.title.trim()) next[`title.${loc}`] = "Title is required.";
      if (!fields.summary.trim()) next[`summary.${loc}`] = "Summary is required.";
    }
    if (!form.slug.trim()) next.slug = "Slug is required.";
    if (!form.videoUrl.trim()) next.videoUrl = "A video URL is required.";
    return next;
  };

  const applyBackendErrors = (err: unknown) => {
    if (!(err instanceof ApiRequestError)) return;
    setErrors(fieldErrors(err.details));
    const inLocale = (field: "title" | "summary", loc: VideoLocale) =>
      err.details?.some((d) => d.field === `${field}.${loc}`);
    const enHit =
      inLocale("title", "en") || inLocale("summary", "en");
    const bnHit =
      inLocale("title", "bn") || inLocale("summary", "bn");
    if (enHit && !bnHit) setLocale("en");
    else if (bnHit) setLocale("bn");
  };

  const effectiveDuration = parseCounter(form.durationSeconds) ?? 0;
  const effectiveViews = parseCounter(form.viewsCount) ?? 0;

  const buildCreateInput = (status: VideoStatus): CreateVideoInput => {
    const input: CreateVideoInput = {
      slug: form.slug.trim(),
      category: form.category,
      authorId: form.authorId,
      videoUrl: form.videoUrl.trim(),
      featured: form.featured,
      status,
      title: {
        bn: form.bn.title.trim(),
        en: form.en.title.trim(),
      },
      summary: {
        bn: form.bn.summary.trim(),
        en: form.en.summary.trim(),
      },
    };
    const duration = parseCounter(form.durationSeconds);
    const views = parseCounter(form.viewsCount);
    if (duration !== undefined) input.durationSeconds = duration;
    if (views !== undefined) input.viewsCount = views;
    if (form.publishedAt) {
      input.publishedAt = new Date(form.publishedAt).toISOString();
    }
    return input;
  };

  const buildPatch = (status: VideoStatus): UpdateVideoInput => {
    if (!detail) return {};
    const patch: UpdateVideoInput = {};
    if (form.slug.trim() !== detail.slug) patch.slug = form.slug.trim();
    if (form.category !== detail.category.slug) patch.category = form.category;
    if ((form.authorId ?? null) !== (detail.author?.id ?? null)) {
      patch.authorId = form.authorId ?? null;
    }
    if (form.videoUrl.trim() !== detail.videoUrl) patch.videoUrl = form.videoUrl.trim();
    if (effectiveDuration !== detail.durationSeconds) {
      patch.durationSeconds = effectiveDuration;
    }
    if (effectiveViews !== detail.viewsCount) {
      patch.viewsCount = effectiveViews;
    }
    if (form.featured !== detail.featured) patch.featured = form.featured;
    if (status !== detail.status) patch.status = status;
    const publishedAt = form.publishedAt
      ? new Date(form.publishedAt).toISOString()
      : null;
    if (publishedAt !== detail.publishedAt) patch.publishedAt = publishedAt;
    for (const loc of LOCALES) {
      const base = detail.localized[loc];
      if (!base) continue;
      if (form[loc].title.trim() !== base.title) {
        patch.title = { ...patch.title, [loc]: form[loc].title.trim() };
      }
      if (form[loc].summary.trim() !== base.summary) {
        patch.summary = { ...patch.summary, [loc]: form[loc].summary.trim() };
      }
    }
    return patch;
  };

  const handleSave = async (intent: "draft" | "publish") => {
    if (saving) return;
    const status: VideoStatus = intent === "publish" ? "published" : "draft";

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const anyEn = Object.keys(nextErrors).some((key) => key.startsWith("title.en") || key.startsWith("summary.en"));
      const anyBn = Object.keys(nextErrors).some((key) => key.startsWith("title.bn") || key.startsWith("summary.bn"));
      setLocale(anyEn && !anyBn ? "en" : "bn");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setApiError(null);
    setSavedNotice(null);
    try {
      if (isEdit && videoId) {
        const updated = await videosApi.update(videoId, buildPatch(status));
        setDetail(updated);
        setLoadedAuthor(updated.author);
        setForm(formFromDetail(updated));
        setSavedNotice(
          `"${updated.title}" saved as ${status === "published" ? "published" : "a draft"}.`,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const created = await videosApi.create(buildCreateInput(status));
        router.push(`/admin/videos/${created.id}/edit`);
      }
    } catch (err) {
      setApiError(apiErrorMessage(err));
      applyBackendErrors(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const previewVideo: Video | undefined = form.videoUrl.trim()
    ? {
        slug: form.slug || "preview",
        category: form.category as CategorySlug,
        categoryName: categoryName(form.category as CategorySlug),
        image: detail?.poster?.url ?? "",
        videoUrl: form.videoUrl.trim(),
        duration: formatDurationSeconds(effectiveDuration),
        views: String(effectiveViews),
        featured: form.featured,
        title: form[locale].title.trim() || "Video preview",
        summary: form[locale].summary.trim(),
        publishedAt: form.publishedAt || "—",
      }
    : undefined;

  if (loading) {
    return (
      <Card className="space-y-4">
        <p className="text-sm text-gray-500">Loading video…</p>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="space-y-4">
        <Alert tone="error" title="Couldn't load this video">
          <p>{loadError}</p>
          <Link href="/admin/videos" className="text-sm font-semibold underline">
            Back to videos
          </Link>
        </Alert>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {savedNotice && (
        <Alert tone="success" icon={<CheckIcon className="h-5 w-5" />}>
          {savedNotice}
        </Alert>
      )}
      {apiError && <Alert tone="error">{apiError}</Alert>}

      <Card className="space-y-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">Title & description</p>
              <p className="text-xs text-gray-500">
                Authoring both বাংলা and English is required by the API.
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
              {(["bn", "en"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={cx(
                    "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                    locale === loc
                      ? "bg-white text-ink-900 shadow-sm"
                      : "text-gray-500 hover:text-ink-900",
                  )}
                >
                  {loc === "bn" ? "বাংলা" : "English"}
                </button>
              ))}
            </div>
          </div>

          <Field label="Title" required error={localizedFieldError(errors, locale, "title")}>
            <TextInput
              type="text"
              value={form[locale].title}
              onChange={(e) => setLocaleField("title", e.target.value)}
              placeholder={locale === "bn" ? "ভিডিওর শিরোনাম" : "Video headline"}
              error={!!localizedFieldError(errors, locale, "title")}
            />
          </Field>

          <Field label="Summary / Description" required error={localizedFieldError(errors, locale, "summary")}>
            <TextArea
              rows={3}
              value={form[locale].summary}
              onChange={(e) => setLocaleField("summary", e.target.value)}
              placeholder="Short description shown in listings"
              error={!!localizedFieldError(errors, locale, "summary")}
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
                onChange={(e) => setField("category", e.target.value)}
              >
                {categoryOptions.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Video URL"
            required
            error={errors.videoUrl}
            hint="Absolute http(s) URL of the hosted video file."
          >
            <TextInput
              type="url"
              value={form.videoUrl}
              onChange={(e) => setField("videoUrl", e.target.value)}
              placeholder="https://example.com/video.mp4"
              error={!!errors.videoUrl}
            />
          </Field>

          {previewVideo && (
            <div>
              <p className="mb-2 text-[13px] font-medium text-gray-700">Preview</p>
              <VideoPlayer
                video={previewVideo}
                className="overflow-hidden rounded-lg border border-gray-200 ring-1 ring-inset ring-gray-900/5"
              />
            </div>
          )}

          <Field
            label="Poster"
            hint="Posters are managed through the Media Library. Selection and upload arrive in a later phase — an existing poster is preserved and never replaced by this form."
          >
            {detail?.poster ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
                  <Image
                    src={detail.poster.url}
                    alt={detail.poster.alt ?? detail.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Current poster from the Media Library — kept as-is for this
                  video.
                </p>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
                No poster assigned yet — the Media Library phase will handle
                selection and upload.
              </p>
            )}
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Duration (seconds)"
              error={errors.durationSeconds}
              hint={effectiveDuration > 0 ? formatDurationSeconds(effectiveDuration) : "e.g. 260 for 4:20"}
            >
              <TextInput
                type="number"
                min={0}
                step={1}
                value={form.durationSeconds}
                onChange={(e) => setField("durationSeconds", e.target.value)}
                placeholder="260"
                error={!!errors.durationSeconds}
              />
            </Field>

            <Field
              label="Views count"
              error={errors.viewsCount}
              hint="Read-only in listings — never incremented by views on the site."
            >
              <TextInput
                type="number"
                min={0}
                step={1}
                value={form.viewsCount}
                onChange={(e) => setField("viewsCount", e.target.value)}
                placeholder="0"
                error={!!errors.viewsCount}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Author (byline)" hint="Signed-in user; author id comes from the backend.">
              <Select
                value={form.authorId ?? ""}
                onChange={(e) =>
                  setField("authorId", e.target.value === "" ? null : e.target.value)
                }
              >
                <option value="">No author</option>
                {authorOptions.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as VideoStatus)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Published date/time"
              error={errors.publishedAt}
              hint="Optional — the backend stamps the publish time when publishing."
            >
              <TextInput
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => setField("publishedAt", e.target.value)}
                error={!!errors.publishedAt}
              />
            </Field>

            <div className="flex flex-wrap items-end gap-x-8 gap-y-4 rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3.5">
              <Checkbox
                label="Featured"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
          <Button
            variant="secondary"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? "Saving…" : "Save Draft"}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave("publish")}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? "Saving…" : "Publish"}
          </Button>
          <Link
            href="/admin/videos"
            className={buttonClasses("outline", "md", "w-full sm:w-auto")}
          >
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}