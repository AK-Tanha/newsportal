"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  categoryOptions,
  slugifyTitle,
  type CmsArticle,
  type CmsArticleStatus,
} from "@/lib/admin-articles";
import type { CategorySlug } from "@/lib/news";
import { adminUser } from "@/lib/admin";
import { CheckIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Field } from "@/components/admin/ui/Field";
import { Checkbox, Select, TextArea, TextInput } from "@/components/admin/ui/inputs";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import {
  seedStoredArticles,
  upsertStoredArticle,
  useStoredArticleById,
} from "./storage";

interface FormState {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: CategorySlug;
  author: string;
  tags: string;
  image: string;
  status: CmsArticleStatus;
  publishedAt: string;
  featured: boolean;
  breaking: boolean;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "national",
  author: "",
  tags: "",
  image: "",
  status: "draft",
  publishedAt: "",
  featured: false,
  breaking: false,
};

function formFromArticle(article?: CmsArticle): FormState {
  if (!article) return initialFormState;
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    content: article.content,
    category: article.category,
    author: article.author,
    tags: article.tags.join(", "),
    image: article.image,
    status: article.status,
    publishedAt: article.publishedAt,
    featured: article.featured,
    breaking: article.breaking,
  };
}

function tagsToArray(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toArticleInput(state: FormState): Omit<CmsArticle, "id"> {
  return {
    slug: state.slug || slugifyTitle(state.title),
    title: state.title.trim(),
    summary: state.summary.trim(),
    content: state.content.trim(),
    category: state.category,
    author: state.author.trim(),
    tags: tagsToArray(state.tags),
    image: state.image.trim(),
    status: state.status,
    publishedAt: state.publishedAt,
    featured: state.featured,
    breaking: state.breaking,
  };
}

function ArticleFormFields({
  seeds,
  articleId,
  current,
}: {
  seeds: CmsArticle[];
  articleId?: string;
  current: CmsArticle | undefined;
}) {
  const [form, setForm] = useState<FormState>(() =>
    formFromArticle(current),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | undefined>(articleId);

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
    if (form.content.trim().length < 20) {
      next.content = "Content is required and must be at least 20 characters.";
    }
    if (!form.author.trim()) next.author = "Author is required.";
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

    seedStoredArticles(seeds);
    const status: CmsArticleStatus = intent === "publish" ? "published" : "draft";
    const id = createdId ?? (articleId ?? Date.now().toString());
    const article: CmsArticle = {
      id,
      ...toArticleInput({ ...form, status }),
    };
    upsertStoredArticle(article);
    if (!createdId) setCreatedId(id);
    setSavedNotice(
      `"${article.title}" saved as ${
        status === "published" ? "published" : "a draft"
      }. (Demo mode — stored in this browser.)`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              placeholder="Article headline"
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

            <Field label="Author" required error={errors.author}>
              <TextInput
                type="text"
                value={form.author}
                onChange={(e) => setField("author", e.target.value)}
                placeholder={adminUser.name}
                error={!!errors.author}
              />
            </Field>
          </div>

          <Field label="Summary / Excerpt" required error={errors.summary}>
            <TextArea
              rows={3}
              value={form.summary}
              onChange={(e) => setField("summary", e.target.value)}
              placeholder="Short summary shown in listings"
              error={!!errors.summary}
            />
          </Field>

          <Field label="Content" required error={errors.content}>
            <TextArea
              rows={10}
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              placeholder="Body paragraphs, separated by blank lines"
              error={!!errors.content}
            />
          </Field>

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

            <Field label="Tags" hint="Comma separated">
              <TextInput
                type="text"
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
                placeholder="comma, separated"
              />
            </Field>
          </div>

          <Field label="Featured image URL" hint="Recommended 1200×800">
            <TextInput
              type="url"
              value={form.image}
              onChange={(e) => setField("image", e.target.value)}
              placeholder="https://picsum.photos/seed/.../1200/800"
            />
          </Field>

          {form.image && (
            <div className="relative h-44 w-full overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5 md:h-56">
              <Image
                src={form.image}
                alt="Featured image preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as CmsArticleStatus)}
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
            <Checkbox
              label="Breaking"
              checked={form.breaking}
              onChange={(e) => setField("breaking", e.target.checked)}
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
            href="/admin/articles"
            className={buttonClasses("outline", "md")}
          >
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function ArticleForm({
  seeds,
  initial,
  articleId,
}: {
  seeds: CmsArticle[];
  initial?: CmsArticle;
  articleId?: string;
}) {
  const stored = useStoredArticleById(articleId ?? initial?.id);
  const current = stored ?? initial;

  return (
    <ArticleFormFields
      key={current?.id ?? "new"}
      seeds={seeds}
      articleId={articleId ?? current?.id}
      current={current}
    />
  );
}