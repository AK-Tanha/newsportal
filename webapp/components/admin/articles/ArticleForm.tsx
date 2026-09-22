"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { categoryOptions, slugifyTitle } from "@/lib/admin-articles";
import { CheckIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Field } from "@/components/admin/ui/Field";
import { Checkbox, Select, TextArea, TextInput } from "@/components/admin/ui/inputs";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { cx } from "@/components/admin/ui/utils";
import {
  ApiRequestError,
  articlesApi,
  apiErrorMessage,
  contentFieldError,
  fetchCurrentUser,
  fieldErrors,
  type ArticleDetailDto,
  type ArticleLocale,
  type ArticleStatus,
  type CreateArticleInput,
  type CurrentUser,
  type UpdateArticleInput,
} from "./api";

interface LocaleForm {
  title: string;
  summary: string;
  body: string;
}

interface FormState {
  slug: string;
  category: string;
  authorId: string | null;
  tags: string;
  status: ArticleStatus;
  publishedAt: string;
  featured: boolean;
  breaking: boolean;
  bn: LocaleForm;
  en: LocaleForm;
}

const LOCALES: ArticleLocale[] = ["bn", "en"];

const emptyForm: FormState = {
  slug: "",
  category: "national",
  authorId: null,
  tags: "",
  status: "draft",
  publishedAt: "",
  featured: false,
  breaking: false,
  bn: { title: "", summary: "", body: "" },
  en: { title: "", summary: "", body: "" },
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

function formFromDetail(detail: ArticleDetailDto): FormState {
  return {
    slug: detail.slug,
    category: detail.category.slug,
    authorId: detail.author?.id ?? null,
    tags: detail.tags.map((tag) => tag.name).join(", "),
    status: detail.status,
    publishedAt: toDateTimeLocal(detail.publishedAt),
    featured: detail.featured,
    breaking: detail.breaking,
    bn: {
      title: detail.content.bn?.title ?? "",
      summary: detail.content.bn?.summary ?? "",
      body: detail.content.bn?.body ?? "",
    },
    en: {
      title: detail.content.en?.title ?? "",
      summary: detail.content.en?.summary ?? "",
      body: detail.content.en?.body ?? "",
    },
  };
}

function tagsToArray(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function ArticleForm({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(articleId);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [locale, setLocale] = useState<ArticleLocale>("bn");
  const [loading, setLoading] = useState(Boolean(articleId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionUser, setSessionUser] = useState<CurrentUser | null>(null);
  const [loadedAuthor, setLoadedAuthor] = useState<{ id: string; name: string } | null>(null);
  const [detail, setDetail] = useState<ArticleDetailDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser()
      .then((user) => {
        if (cancelled) return;
        setSessionUser(user);
        if (!articleId) {
          setForm((prev) => ({ ...prev, authorId: user.id }));
        }
      })
      .catch(() => {});

    if (articleId) {
      articlesApi
        .get(articleId)
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
  }, [articleId]);

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

  const setLocaleField = (field: keyof LocaleForm, value: string) => {
    setForm((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`content.${locale}.${field}`];
      delete next[`content.${locale}`];
      delete next[`${locale}.${field}`];
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
      const content = form[loc];
      if (!content.title.trim()) next[`${loc}.title`] = "Title is required.";
      if (!content.summary.trim()) next[`${loc}.summary`] = "Summary is required.";
      if (!content.body.trim()) next[`${loc}.body`] = "Content is required.";
    }
    if (!form.slug.trim()) next.slug = "Slug is required.";
    return next;
  };

  const applyBackendErrors = (err: unknown) => {
    if (!(err instanceof ApiRequestError)) return;
    setErrors(fieldErrors(err.details));
    const inLocale = (prefix: string) =>
      err.details?.some((d) => d.field === prefix || d.field.startsWith(`${prefix}.`));
    if (inLocale("content.en")) setLocale("en");
    else if (inLocale("content.bn")) setLocale("bn");
  };

  const buildLocalized = (loc: ArticleLocale) => ({
    title: form[loc].title.trim(),
    summary: form[loc].summary.trim(),
    body: form[loc].body.trim(),
  });

  const buildCreateInput = (status: ArticleStatus): CreateArticleInput => {
    const input: CreateArticleInput = {
      slug: form.slug.trim(),
      category: form.category,
      authorId: form.authorId,
      status,
      isFeatured: form.featured,
      isBreaking: form.breaking,
      content: { bn: buildLocalized("bn"), en: buildLocalized("en") },
      tags: tagsToArray(form.tags),
    };
    if (form.publishedAt) {
      input.publishedAt = new Date(form.publishedAt).toISOString();
    }
    return input;
  };

  const buildPatch = (status: ArticleStatus): UpdateArticleInput => {
    if (!detail) return {};
    const patch: UpdateArticleInput = {};
    if (form.slug.trim() !== detail.slug) patch.slug = form.slug.trim();
    if (form.category !== detail.category.slug) patch.category = form.category;
    if ((form.authorId ?? null) !== (detail.author?.id ?? null)) {
      patch.authorId = form.authorId ?? null;
    }
    if (status !== detail.status) patch.status = status;
    if (form.featured !== detail.featured) patch.isFeatured = form.featured;
    if (form.breaking !== detail.breaking) patch.isBreaking = form.breaking;
    const publishedAt = form.publishedAt
      ? new Date(form.publishedAt).toISOString()
      : null;
    if (publishedAt !== detail.publishedAt) patch.publishedAt = publishedAt;
    const formTags = tagsToArray(form.tags).sort();
    const baseTags = detail.tags.map((tag) => tag.name).sort();
    if (JSON.stringify(formTags) !== JSON.stringify(baseTags)) {
      patch.tags = formTags;
    }
    for (const loc of LOCALES) {
      const current = form[loc];
      const base = detail.content[loc];
      if (
        !base ||
        current.title.trim() !== base.title ||
        current.summary.trim() !== base.summary ||
        current.body.trim() !== base.body
      ) {
        patch.content = { ...patch.content, [loc]: buildLocalized(loc) };
      }
    }
    return patch;
  };

  const handleSave = async (intent: "draft" | "publish") => {
    if (saving) return;
    const status: ArticleStatus = intent === "publish" ? "published" : "draft";

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const anyEn = Object.keys(nextErrors).some((key) => key.startsWith("en."));
      const anyBn = Object.keys(nextErrors).some((key) => key.startsWith("bn."));
      setLocale(anyEn && !anyBn ? "en" : "bn");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setApiError(null);
    setSavedNotice(null);
    try {
      if (isEdit && articleId) {
        const updated = await articlesApi.update(articleId, buildPatch(status));
        setDetail(updated);
        setLoadedAuthor(updated.author);
        setForm(formFromDetail(updated));
        setSavedNotice(
          `"${updated.title}" saved as ${status === "published" ? "published" : "a draft"}.`,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const created = await articlesApi.create(buildCreateInput(status));
        router.push(`/admin/articles/${created.id}/edit`);
      }
    } catch (err) {
      setApiError(apiErrorMessage(err));
      applyBackendErrors(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="space-y-4">
        <p className="text-sm text-gray-500">Loading article…</p>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="space-y-4">
        <Alert tone="error" title="Couldn't load this article">
          <p>{loadError}</p>
          <Link href="/admin/articles" className="text-sm font-semibold underline">
            Back to articles
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
              <p className="text-sm font-semibold text-ink-900">Content</p>
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

          <Field
            label="Title"
            required
            error={contentFieldError(errors, locale, "title")}
          >
            <TextInput
              type="text"
              value={form[locale].title}
              onChange={(e) => setLocaleField("title", e.target.value)}
              placeholder={locale === "bn" ? "শিরোনাম" : "Article headline"}
              error={!!contentFieldError(errors, locale, "title")}
            />
          </Field>

          <Field
            label="Summary / Excerpt"
            required
            error={contentFieldError(errors, locale, "summary")}
          >
            <TextArea
              rows={3}
              value={form[locale].summary}
              onChange={(e) => setLocaleField("summary", e.target.value)}
              placeholder="Short summary shown in listings"
              error={!!contentFieldError(errors, locale, "summary")}
            />
          </Field>

          <Field
            label="Content"
            required
            hint="Plain text — paragraphs separated by blank lines. Rich-text editing arrives in a later phase."
            error={contentFieldError(errors, locale, "body")}
          >
            <TextArea
              rows={10}
              value={form[locale].body}
              onChange={(e) => setLocaleField("body", e.target.value)}
              placeholder="Body paragraphs, separated by blank lines"
              error={!!contentFieldError(errors, locale, "body")}
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
                <Button
                  variant="secondary"
                  onClick={generateSlug}
                  className="shrink-0"
                >
                  Generate
                </Button>
              </div>
            </Field>

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
          </div>

          <div className="grid gap-5 md:grid-cols-2">
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

            <Field label="Tags" hint="Comma separated">
              <TextInput
                type="text"
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
                placeholder="comma, separated"
              />
            </Field>
          </div>

          <Field
            label="Featured image"
            hint="Media Library integration is pending. The featured image is managed through the Media phase and stays unchanged for now."
          >
            {detail?.image ? (
              <div className="relative h-44 w-full overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5 md:h-56">
                <Image
                  src={detail.image.url}
                  alt={detail.image.alt ?? detail.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
                No featured image assigned yet — the Media Library phase will
                handle uploads and selection.
              </p>
            )}
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as ArticleStatus)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>

            <Field
              label="Published date/time"
              hint="Optional — the backend stamps the publish time when publishing."
              error={errors.publishedAt}
            >
              <TextInput
                type="datetime-local"
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
            <Checkbox
              label="Breaking"
              checked={form.breaking}
              onChange={(e) => setField("breaking", e.target.checked)}
            />
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
            href="/admin/articles"
            className={buttonClasses("outline", "md", "w-full sm:w-auto")}
          >
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}