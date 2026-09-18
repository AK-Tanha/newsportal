"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { slugifyTitle } from "@/lib/admin-articles";
import {
  adPositionOptions,
  isValidHttpUrl,
  type CmsAd,
} from "@/lib/admin-ads";
import type { Ad, AdPlacement, AdType } from "@/lib/ads";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { AdBanner, AdText, SponsoredAdCard } from "@/components/ads";
import { CheckIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui/Card";
import { Field } from "@/components/admin/ui/Field";
import { Checkbox, Select, TextArea, TextInput } from "@/components/admin/ui/inputs";
import { Button, buttonClasses } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import {
  seedStoredAds,
  upsertStoredAd,
  useStoredAdById,
} from "./storage";

interface FormState {
  name: string;
  description: string;
  type: AdType;
  positions: AdPlacement[];
  image: string;
  targetUrl: string;
  alt: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  description: "",
  type: "banner",
  positions: [],
  image: "",
  targetUrl: "",
  alt: "",
  active: true,
  startDate: "",
  endDate: "",
};

function formFromAd(ad?: CmsAd): FormState {
  if (!ad) return initialFormState;
  return {
    name: ad.name,
    description: ad.description,
    type: ad.type,
    positions: [...ad.positions],
    image: ad.image,
    targetUrl: ad.targetUrl,
    alt: ad.alt,
    active: ad.active,
    startDate: ad.startDate,
    endDate: ad.endDate,
  };
}

function toAdInput(state: FormState): Omit<CmsAd, "id"> {
  return {
    slug: slugifyTitle(state.name),
    name: state.name.trim(),
    description: state.description.trim(),
    type: state.type,
    positions: [...state.positions],
    image: state.image.trim(),
    targetUrl: state.targetUrl.trim(),
    alt: state.alt.trim(),
    active: state.active,
    startDate: state.startDate,
    endDate: state.endDate,
  };
}

function AdvertisementFormFields({
  seeds,
  adId,
  current,
}: {
  seeds: CmsAd[];
  adId?: string;
  current: CmsAd | undefined;
}) {
  const dict = getDictionaryStatic("en");
  const [form, setForm] = useState<FormState>(() => formFromAd(current));
  const [errors, setErrors] = useState<FormErrors>({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | undefined>(adId);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const togglePosition = (placement: AdPlacement) => {
    const has = form.positions.includes(placement);
    setForm((prev) => ({
      ...prev,
      positions: has
        ? prev.positions.filter((p) => p !== placement)
        : [...prev.positions, placement],
    }));
    setErrors((prev) => ({ ...prev, positions: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Ad name is required.";
    if (!form.targetUrl.trim()) {
      next.targetUrl = "Target URL is required.";
    } else if (!isValidHttpUrl(form.targetUrl.trim())) {
      next.targetUrl = "Enter a valid http(s) URL.";
    }
    if ((form.type === "banner" || form.type === "sponsored") && !form.image.trim()) {
      next.image = "A banner image URL is required for this ad type.";
    } else if (form.image.trim() && !isValidHttpUrl(form.image.trim())) {
      next.image = "Enter a valid image URL.";
    }
    if (form.positions.length === 0) {
      next.positions = "Select at least one position.";
    }
    if (!form.startDate) {
      next.startDate = "Start date is required.";
    } else if (form.endDate && form.endDate < form.startDate) {
      next.endDate = "End date must be on or after the start date.";
    }
    return next;
  };

  const handleSave = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    seedStoredAds(seeds);
    const id = createdId ?? (adId ?? Date.now().toString());
    const ad: CmsAd = {
      id,
      ...toAdInput(form),
    };
    upsertStoredAd(ad);
    if (!createdId) setCreatedId(id);
    setSavedNotice(
      `"${ad.name}" saved as ${ad.active ? "active" : "inactive"}. (Demo mode — stored in this browser.)`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previewAd: Ad = {
    slug: slugifyTitle(form.name) || "preview",
    type: form.type,
    placements: form.positions,
    image: form.image.trim() || undefined,
    link: form.targetUrl.trim() || "https://example.com",
    title: form.name || "Ad preview",
    description: form.description.trim() || undefined,
    sponsored: form.type === "sponsored",
  };

  return (
    <div className="space-y-5">
      {savedNotice && (
        <Alert tone="success" icon={<CheckIcon className="h-5 w-5" />}>
          {savedNotice}
        </Alert>
      )}

      <Alert tone="info">
        Frontend-only demo: advertisements are stored in this browser only. A
        database backend will be connected later.
      </Alert>

      <Card className="space-y-6">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Ad name" required error={errors.name}>
              <TextInput
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Grameenphone 5G nationwide"
                error={!!errors.name}
              />
            </Field>

            <Field label="Ad type" required>
              <Select
                value={form.type}
                onChange={(e) => setField("type", e.target.value as AdType)}
              >
                <option value="banner">Banner</option>
                <option value="text">Text</option>
                <option value="sponsored">Sponsored</option>
              </Select>
            </Field>
          </div>

          <Field label="Description" hint="Shown with text or sponsored ads">
            <TextArea
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Short description shown with text or sponsored ads"
            />
          </Field>

          <Field label="Positions" required error={errors.positions}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {adPositionOptions.map((option) => {
                const checked = form.positions.includes(option.placement);
                return (
                  <label
                    key={option.placement}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      checked
                        ? "border-brand/40 bg-brand/10 text-ink-900 ring-1 ring-inset ring-brand/20"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePosition(option.placement)}
                      className="h-4 w-4 rounded accent-brand"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Banner / Image URL" required={form.type !== "text"} error={errors.image}>
              <TextInput
                type="url"
                value={form.image}
                onChange={(e) => setField("image", e.target.value)}
                placeholder="https://picsum.photos/seed/.../1200/400"
                error={!!errors.image}
              />
            </Field>

            <Field label="Target URL" required error={errors.targetUrl}>
              <TextInput
                type="url"
                value={form.targetUrl}
                onChange={(e) => setField("targetUrl", e.target.value)}
                placeholder="https://advertiser.example.com"
                error={!!errors.targetUrl}
              />
            </Field>
          </div>

          {form.image && (form.type === "banner" || form.type === "sponsored") && (
            <div className="relative aspect-[5/2] w-full max-w-md overflow-hidden rounded-lg bg-gray-100 ring-1 ring-inset ring-gray-900/5">
              <Image
                src={form.image}
                alt={form.alt || form.name || "Ad image preview"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <Field label="Alt text" hint="Screen-reader description of the ad">
            <TextInput
              type="text"
              value={form.alt}
              onChange={(e) => setField("alt", e.target.value)}
              placeholder="Screen-reader description of the ad"
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Start date" required error={errors.startDate}>
              <TextInput
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                error={!!errors.startDate}
              />
            </Field>

            <Field label="End date" error={errors.endDate}>
              <TextInput
                type="date"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                error={!!errors.endDate}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3.5">
            <Checkbox
              label="Active"
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

        <div className="flex flex-wrap items-center gap-2.5 border-t border-gray-100 pt-5">
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
          <Link
            href="/admin/ads"
            className={buttonClasses("outline", "md")}
          >
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function AdvertisementForm({
  seeds,
  initial,
  adId,
}: {
  seeds: CmsAd[];
  initial?: CmsAd;
  adId?: string;
}) {
  const stored = useStoredAdById(adId ?? initial?.id);
  const current = stored ?? initial;

  return (
    <AdvertisementFormFields
      key={current?.id ?? "new"}
      seeds={seeds}
      adId={adId ?? current?.id}
      current={current}
    />
  );
}