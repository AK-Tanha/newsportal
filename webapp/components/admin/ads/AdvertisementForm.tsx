"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { slugifyTitle } from "@/lib/admin-articles";
import { adPositionOptions, isValidHttpUrl } from "@/lib/admin-ads";
import type { Ad, AdPlacement, AdType } from "@/lib/ads";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { AdBanner, AdText, SponsoredAdCard } from "@/components/ads";
import { CheckIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Field } from "@/components/admin/ui/Field";
import { Checkbox, Select, TextArea, TextInput } from "@/components/admin/ui/inputs";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { cx } from "@/components/admin/ui/utils";
import {
  adsApi,
  ApiRequestError,
  apiErrorMessage,
  fieldErrors,
  flatFieldError,
  localizedFieldError,
  type AdDetailDto,
  type AdLocale,
  type CreateAdInput,
  type UpdateAdInput,
} from "./api";

interface LocaleFields {
  name: string;
  description: string;
}

interface FormState {
  slug: string;
  type: AdType;
  placements: AdPlacement[];
  targetUrl: string;
  alt: string;
  active: boolean;
  startDate: string;
  endDate: string;
  imageMediaId: string | null;
  bn: LocaleFields;
  en: LocaleFields;
}

const LOCALES: AdLocale[] = ["bn", "en"];

const emptyForm: FormState = {
  slug: "",
  type: "banner",
  placements: [],
  targetUrl: "",
  alt: "",
  active: true,
  startDate: "",
  endDate: "",
  imageMediaId: null,
  bn: { name: "", description: "" },
  en: { name: "", description: "" },
};

function formFromDetail(detail: AdDetailDto): FormState {
  return {
    slug: detail.slug,
    type: detail.type,
    placements: [...detail.placements],
    targetUrl: detail.targetUrl,
    alt: detail.alt ?? "",
    active: detail.active,
    startDate: detail.startDate ?? "",
    endDate: detail.endDate ?? "",
    imageMediaId: detail.imageMediaId,
    bn: {
      name: detail.localized.bn?.name ?? "",
      description: detail.localized.bn?.description ?? "",
    },
    en: {
      name: detail.localized.en?.name ?? "",
      description: detail.localized.en?.description ?? "",
    },
  };
}

function sameSet(a: AdPlacement[], b: AdPlacement[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

export default function AdvertisementForm({ adId }: { adId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(adId);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [locale, setLocale] = useState<AdLocale>("bn");
  const [detail, setDetail] = useState<AdDetailDto | null>(null);
  const [loading, setLoading] = useState(Boolean(adId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!adId) return;
    let cancelled = false;
    adsApi
      .get(adId)
      .then((result) => {
        if (cancelled) return;
        setDetail(result);
        setForm(formFromDetail(result));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(apiErrorMessage(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adId]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
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

  const togglePlacement = (placement: AdPlacement) => {
    setForm((prev) => ({
      ...prev,
      placements: prev.placements.includes(placement)
        ? prev.placements.filter((entry) => entry !== placement)
        : [...prev.placements, placement],
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.placements;
      delete next.placement;
      return next;
    });
  };

  const generateSlug = () => {
    const source = form.en.name.trim() || form.bn.name.trim();
    if (!source) {
      setErrors((prev) => ({
        ...prev,
        slug: "Enter a name first, then generate the slug.",
      }));
      return;
    }
    const slug = slugifyTitle(source);
    if (!slug) {
      setErrors((prev) => ({
        ...prev,
        slug: "Could not derive a slug from that name. Enter one manually.",
      }));
      return;
    }
    setField("slug", slug);
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    for (const loc of LOCALES) {
      if (!form[loc].name.trim()) next[`name.${loc}`] = "Name is required.";
    }
    if (!form.slug.trim()) next.slug = "Slug is required.";
    const targetUrl = form.targetUrl.trim();
    if (!targetUrl) {
      next.targetUrl = "Target URL is required.";
    } else if (!isValidHttpUrl(targetUrl)) {
      next.targetUrl = "Enter a valid http(s) URL.";
    }
    if (!isEdit && form.placements.length === 0) {
      next.placements = "Select at least one placement.";
    }
    return next;
  };

  const applyBackendErrors = (err: unknown) => {
    const details = fieldErrors(
      err instanceof ApiRequestError ? err.details : undefined,
    );
    setErrors(details);
    const enHit = details["name.en"] !== undefined || details["description.en"] !== undefined;
    const bnHit = details["name.bn"] !== undefined || details["description.bn"] !== undefined;
    if (enHit && !bnHit) setLocale("en");
    else if (bnHit) setLocale("bn");
  };

  const buildCreateInput = (): CreateAdInput => {
    const input: CreateAdInput = {
      slug: form.slug.trim(),
      type: form.type,
      name: {
        bn: form.bn.name.trim(),
        en: form.en.name.trim(),
      },
      targetUrl: form.targetUrl.trim(),
      alt: form.alt.trim() ? form.alt.trim() : null,
      active: form.active,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      placements: [...form.placements],
    };
    const description: Partial<Record<AdLocale, string | null>> = {};
    if (form.bn.description.trim()) description.bn = form.bn.description.trim();
    if (form.en.description.trim()) description.en = form.en.description.trim();
    if (Object.keys(description).length > 0) input.description = description;
    return input;
  };

  const buildPatch = (): UpdateAdInput => {
    if (!detail) return {};
    const patch: UpdateAdInput = {};

    if (form.slug.trim() !== detail.slug) patch.slug = form.slug.trim();
    if (form.type !== detail.type) patch.type = form.type;
    if (form.targetUrl.trim() !== detail.targetUrl) {
      patch.targetUrl = form.targetUrl.trim();
    }
    const alt = form.alt.trim();
    if (alt !== (detail.alt ?? "")) patch.alt = alt ? alt : null;
    if (form.active !== detail.active) patch.active = form.active;

    const startDate = form.startDate || null;
    if (startDate !== (detail.startDate ?? null)) patch.startDate = startDate;
    const endDate = form.endDate || null;
    if (endDate !== (detail.endDate ?? null)) patch.endDate = endDate;

    if (!sameSet(form.placements, detail.placements)) {
      patch.placements = [...form.placements];
    }

    for (const loc of LOCALES) {
      const name = form[loc].name.trim();
      if (name !== (detail.localized[loc]?.name ?? "")) {
        patch.name = { ...patch.name, [loc]: name };
      }
      const description = form[loc].description.trim();
      if (description !== (detail.localized[loc]?.description ?? "")) {
        patch.description = { ...patch.description, [loc]: description ? description : null };
      }
    }

    // Media Library selection is a later phase: the only media change this
    // form can express is clearing the existing image (null).
    if (detail.imageMediaId !== null && form.imageMediaId === null) {
      patch.imageMediaId = null;
    }

    return patch;
  };

  const handleSave = async () => {
    if (saving) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const anyEn = Object.keys(nextErrors).some(
        (key) => key.startsWith("name.en") || key.startsWith("description.en"),
      );
      const anyBn = Object.keys(nextErrors).some(
        (key) => key.startsWith("name.bn") || key.startsWith("description.bn"),
      );
      setLocale(anyEn && !anyBn ? "en" : "bn");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setApiError(null);
    setSavedNotice(null);
    try {
      if (isEdit && adId) {
        const updated = await adsApi.update(adId, buildPatch());
        setDetail(updated);
        setForm(formFromDetail(updated));
        setSavedNotice(`"${updated.name}" saved.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const created = await adsApi.create(buildCreateInput());
        router.push(`/admin/ads/${created.id}/edit`);
      }
    } catch (err) {
      setApiError(apiErrorMessage(err));
      applyBackendErrors(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const dict = getDictionaryStatic("en");
  const imageUrl = form.imageMediaId === null ? undefined : detail?.image?.url;
  const previewAd: Ad = {
    slug: form.slug || "preview",
    type: form.type,
    placements: form.placements,
    image: imageUrl,
    link: form.targetUrl.trim() || "https://example.com",
    title: form[locale].name.trim() || "Ad preview",
    description: form[locale].description.trim() || undefined,
    sponsored: form.type === "sponsored",
  };

  const placementsError =
    flatFieldError(errors, "placements") ?? flatFieldError(errors, "placement");
  const imageCleared = detail?.imageMediaId != null && form.imageMediaId === null;

  if (loading) {
    return (
      <Card className="space-y-4">
        <p className="text-sm text-gray-500">Loading advertisement…</p>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="space-y-4">
        <Alert tone="error" title="Couldn't load this advertisement">
          <p>{loadError}</p>
          <Link href="/admin/ads" className="text-sm font-semibold underline">
            Back to advertisements
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
      <Alert tone="info">
        Images are managed through the Media Library. Selection and upload arrive
        in a later phase — an existing image is preserved and is only changed if
        you clear it here.
      </Alert>

      <Card className="space-y-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">Name & description</p>
              <p className="text-xs text-gray-500">
                Authoring both বাংলা and English names is required by the API.
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
            label="Ad name"
            required
            error={localizedFieldError(errors, locale, "name")}
          >
            <TextInput
              type="text"
              value={form[locale].name}
              onChange={(e) => setLocaleField("name", e.target.value)}
              placeholder="e.g. Grameenphone 5G nationwide"
              error={!!localizedFieldError(errors, locale, "name")}
            />
          </Field>

          <Field
            label="Description"
            hint="Optional — shown with text or sponsored ads"
            error={localizedFieldError(errors, locale, "description")}
          >
            <TextArea
              rows={3}
              value={form[locale].description}
              onChange={(e) => setLocaleField("description", e.target.value)}
              placeholder="Short description shown with text or sponsored ads"
              error={!!localizedFieldError(errors, locale, "description")}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Slug" error={flatFieldError(errors, "slug")} hint="Auto-generated from the name">
              <div className="flex gap-2">
                <TextInput
                  type="text"
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  placeholder="auto-generated from name"
                  error={!!flatFieldError(errors, "slug")}
                />
                <Button variant="secondary" onClick={generateSlug} className="shrink-0">
                  Generate
                </Button>
              </div>
            </Field>

            <Field label="Ad type" required error={flatFieldError(errors, "type")}>
              <Select
                value={form.type}
                onChange={(e) => setField("type", e.target.value as AdType)}
                error={!!flatFieldError(errors, "type")}
              >
                <option value="banner">Banner</option>
                <option value="text">Text</option>
                <option value="sponsored">Sponsored</option>
              </Select>
            </Field>
          </div>

          <Field
            label="Placements"
            required={!isEdit}
            error={placementsError}
            hint={
              isEdit
                ? "PATCH replaces the full placement set. You may remove all placements."
                : "At least one placement is required."
            }
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {adPositionOptions.map((option) => {
                const checked = form.placements.includes(option.placement);
                return (
                  <label
                    key={option.placement}
                    className={cx(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      checked
                        ? "border-brand/40 bg-brand/10 text-ink-900 ring-1 ring-inset ring-brand/20"
                        : "border-gray-300 text-gray-600 hover:border-gray-400",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlacement(option.placement)}
                      className="h-4 w-4 rounded accent-brand"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Target URL" required error={flatFieldError(errors, "targetUrl")}>
              <TextInput
                type="url"
                value={form.targetUrl}
                onChange={(e) => setField("targetUrl", e.target.value)}
                placeholder="https://advertiser.example.com"
                error={!!flatFieldError(errors, "targetUrl")}
              />
            </Field>

            <Field label="Alt text" error={flatFieldError(errors, "alt")} hint="Screen-reader description of the ad">
              <TextInput
                type="text"
                value={form.alt}
                onChange={(e) => setField("alt", e.target.value)}
                placeholder="Screen-reader description of the ad"
                error={!!flatFieldError(errors, "alt")}
              />
            </Field>
          </div>

          <Field
            label="Image"
            error={flatFieldError(errors, "imageMediaId")}
            hint="Media Library selection and upload are a later phase — this form never fabricates media ids."
          >
            {imageUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-[5/2] w-full max-w-md overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
                  <Image
                    src={imageUrl}
                    alt={form.alt || form[locale].name || "Ad image preview"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setField("imageMediaId", null)}
                >
                  Clear image
                </Button>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
                {imageCleared
                  ? "The existing image will be removed when you save."
                  : "No image assigned. The Media Library phase will handle selection and upload."}
              </p>
            )}
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Start date"
              error={flatFieldError(errors, "startDate")}
              hint="Optional calendar date (YYYY-MM-DD)"
            >
              <TextInput
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                error={!!flatFieldError(errors, "startDate")}
              />
            </Field>

            <Field
              label="End date"
              error={flatFieldError(errors, "endDate")}
              hint="Optional — must be on or after the start date"
            >
              <TextInput
                type="date"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                error={!!flatFieldError(errors, "endDate")}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3.5">
            <Checkbox
              label="Active"
              description="Inactive ads are never returned by the public placements."
              checked={form.active}
              onChange={(e) => setField("active", e.target.checked)}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="mb-2 text-[13px] font-medium text-gray-700">Live preview</p>
          <div className="max-w-lg" onClick={(e) => e.preventDefault()}>
            {form.type === "text" ? (
              <AdText ad={previewAd} dict={dict} />
            ) : form.type === "sponsored" ? (
              <SponsoredAdCard ad={previewAd} dict={dict} />
            ) : (
              <AdBanner ad={previewAd} dict={dict} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create ad"}
          </Button>
          <Link
            href="/admin/ads"
            className={buttonClasses("outline", "md", "w-full sm:w-auto")}
          >
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}