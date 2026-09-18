"use client";

import { useEffect, useState } from "react";
import type { CmsSettings, SettingsErrors } from "@/lib/admin-settings";
import {
  getDefaultCmsSettings,
  liveStreamOptions,
  validateSettings,
} from "@/lib/admin-settings";
import { liveSlugLabel } from "@/lib/admin-settings";
import { CheckIcon, SettingsIcon } from "@/components/admin/icons";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field } from "@/components/admin/ui/Field";
import {
  Select,
  TextArea as UITextArea,
  TextInput as UITextInput,
} from "@/components/admin/ui/inputs";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { Modal } from "@/components/admin/ui/Modal";
import {
  persistSettings,
  resetSettings,
  useStoredSettings,
} from "./storage";

export default function SettingsManager({
  defaults,
}: {
  defaults: CmsSettings;
}) {
  const stored = useStoredSettings();
  const [form, setForm] = useState<CmsSettings>(stored ?? defaults);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [prevStored, setPrevStored] = useState(stored);

  if (stored !== prevStored) {
    setPrevStored(stored);
    if (!dirty) setForm(stored);
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const setField = <K extends keyof CmsSettings>(
    field: K,
    value: CmsSettings[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const save = () => {
    const nextErrors = validateSettings(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setNotice(
        "Please fix the highlighted fields before saving.",
      );
      return;
    }
    persistSettings(form);
    setDirty(false);
    setConfirmed(true);
    setNotice("Settings saved to this browser only (demo).");
  };

  const reset = () => {
    resetSettings();
    setForm(getDefaultCmsSettings());
    setDirty(false);
    setErrors({});
    setConfirmingReset(false);
    setNotice("Settings restored to defaults (this browser only).");
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <Alert tone="warning" icon={<SettingsIcon className="mt-0.5 h-4 w-4 shrink-0" />}>
        Changes are saved to this browser only (demo). These values mirror
        what the public site currently hardcodes — wire them into the public
        site from the backend in a later phase.
      </Alert>

      {notice && (
        <Alert
          tone={errorCount > 0 ? "error" : "success"}
          icon={errorCount === 0 ? <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" /> : undefined}
        >
          {notice}
        </Alert>
      )}

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Section
          title="Site identity"
          description="Brand name, tagline and site brand assets."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site name (বাংলা)" error={errors.siteNameBn}>
              <TextInput
                value={form.siteNameBn}
                onChange={(v) => setField("siteNameBn", v)}
                error={!!errors.siteNameBn}
              />
            </Field>
            <Field label="Site name (English)" error={errors.siteNameEn}>
              <TextInput
                value={form.siteNameEn}
                onChange={(v) => setField("siteNameEn", v)}
                error={!!errors.siteNameEn}
              />
            </Field>
            <Field label="Tagline (বাংলা)" error={errors.taglineBn}>
              <TextInput
                value={form.taglineBn}
                onChange={(v) => setField("taglineBn", v)}
                error={!!errors.taglineBn}
              />
            </Field>
            <Field label="Tagline (English)" error={errors.taglineEn}>
              <TextInput
                value={form.taglineEn}
                onChange={(v) => setField("taglineEn", v)}
                error={!!errors.taglineEn}
              />
            </Field>
            <Field label="Logo path or URL" error={errors.logoUrl}>
              <TextInput
                value={form.logoUrl}
                onChange={(v) => setField("logoUrl", v)}
                error={!!errors.logoUrl}
                placeholder="/logo.png"
              />
            </Field>
            <Field label="Favicon path or URL" error={errors.faviconUrl}>
              <TextInput
                value={form.faviconUrl}
                onChange={(v) => setField("faviconUrl", v)}
                error={!!errors.faviconUrl}
                placeholder="/icon.png"
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Contact & social"
          description="Newsletter address, editor and social profiles shown in the header and footer."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Newsletter email" error={errors.newsletterEmail}>
              <TextInput
                value={form.newsletterEmail}
                onChange={(v) => setField("newsletterEmail", v)}
                error={!!errors.newsletterEmail}
                placeholder="newsletter@rudrokhobor.com"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Editor (বাংলা)">
                <TextInput
                  value={form.editorNameBn}
                  onChange={(v) => setField("editorNameBn", v)}
                />
              </Field>
              <Field label="Editor (English)">
                <TextInput
                  value={form.editorNameEn}
                  onChange={(v) => setField("editorNameEn", v)}
                />
              </Field>
            </div>
            <Field label="Facebook URL" error={errors.facebookUrl}>
              <TextInput
                value={form.facebookUrl}
                onChange={(v) => setField("facebookUrl", v)}
                error={!!errors.facebookUrl}
                placeholder="https://facebook.com"
              />
            </Field>
            <Field label="Twitter / X URL" error={errors.twitterUrl}>
              <TextInput
                value={form.twitterUrl}
                onChange={(v) => setField("twitterUrl", v)}
                error={!!errors.twitterUrl}
                placeholder="https://twitter.com"
              />
            </Field>
            <Field label="Instagram URL" error={errors.instagramUrl}>
              <TextInput
                value={form.instagramUrl}
                onChange={(v) => setField("instagramUrl", v)}
                error={!!errors.instagramUrl}
                placeholder="https://instagram.com"
              />
            </Field>
            <Field label="YouTube URL" error={errors.youtubeUrl}>
              <TextInput
                value={form.youtubeUrl}
                onChange={(v) => setField("youtubeUrl", v)}
                error={!!errors.youtubeUrl}
                placeholder="https://youtube.com"
              />
            </Field>
          </div>
        </Section>

        <Section
          title="News feed"
          description="Homepage and ticker behaviour the frontend actually renders."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Latest articles on homepage"
              error={errors.latestArticlesCount}
              hint="Currently renders 8 (articles 3–10)."
            >
              <NumberInput
                value={form.latestArticlesCount}
                onChange={(v) => setField("latestArticlesCount", v)}
                error={!!errors.latestArticlesCount}
              />
            </Field>
            <Field
              label="Most-read list size"
              error={errors.mostReadCount}
              hint="Shown in the sidebar as a ranked list."
            >
              <NumberInput
                value={form.mostReadCount}
                onChange={(v) => setField("mostReadCount", v)}
                error={!!errors.mostReadCount}
              />
            </Field>
            <Field
              label="Breaking ticker items"
              error={errors.breakingMaxItems}
              hint="Breaking ticker currently has no cap; this caps it."
            >
              <NumberInput
                value={form.breakingMaxItems}
                onChange={(v) => setField("breakingMaxItems", v)}
                error={!!errors.breakingMaxItems}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Live news"
          description="Which live stream the live page should show by default."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default live stream" error={errors.defaultLiveSlug}>
              <Select
                value={form.defaultLiveSlug}
                onChange={(e) => setField("defaultLiveSlug", e.target.value)}
                error={!!errors.defaultLiveSlug}
              >
                <option value="">No live stream (off the air)</option>
                {liveStreamOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <p className="self-end text-xs text-gray-500">
              Mirrors the site&rsquo;s active stream. Currently configured:
              <span className="font-semibold text-ink-900">
                {" "}
                {liveSlugLabel(form.defaultLiveSlug)}
              </span>
            </p>
          </div>
        </Section>

        <Section
          title="SEO"
          description="Default metadata used for the site across the app."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default meta title (বাংলা)" error={errors.metaTitleBn}>
              <TextInput
                value={form.metaTitleBn}
                onChange={(v) => setField("metaTitleBn", v)}
                error={!!errors.metaTitleBn}
              />
            </Field>
            <Field label="Default meta title (English)" error={errors.metaTitleEn}>
              <TextInput
                value={form.metaTitleEn}
                onChange={(v) => setField("metaTitleEn", v)}
                error={!!errors.metaTitleEn}
              />
            </Field>
            <Field
              label="Default meta description (বাংলা)"
              error={errors.metaDescriptionBn}
            >
              <TextArea
                value={form.metaDescriptionBn}
                onChange={(v) => setField("metaDescriptionBn", v)}
                error={!!errors.metaDescriptionBn}
              />
            </Field>
            <Field
              label="Default meta description (English)"
              error={errors.metaDescriptionEn}
            >
              <TextArea
                value={form.metaDescriptionEn}
                onChange={(v) => setField("metaDescriptionEn", v)}
                error={!!errors.metaDescriptionEn}
              />
            </Field>
            <Field label="Open Graph image path or URL" error={errors.ogImageUrl}>
              <TextInput
                value={form.ogImageUrl}
                onChange={(v) => setField("ogImageUrl", v)}
                error={!!errors.ogImageUrl}
                placeholder="/logo.png"
              />
            </Field>
            <Field label="Canonical base URL" error={errors.metadataBaseUrl}>
              <TextInput
                value={form.metadataBaseUrl}
                onChange={(v) => setField("metadataBaseUrl", v)}
                error={!!errors.metadataBaseUrl}
                placeholder="https://rudrokhobor.example.com"
              />
            </Field>
          </div>
        </Section>

        <Card className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmingReset(true)}>
            Reset to defaults
          </Button>
          <Button variant="primary" type="submit">
            <CheckIcon className="h-4 w-4" />
            Save changes
          </Button>
          {confirmed && !dirty && <Badge tone="green">Saved</Badge>}
        </Card>
      </form>

      <Modal
        open={confirmingReset}
        onClose={() => setConfirmingReset(false)}
        title="Reset all settings?"
        description="All fields will be restored to the site's default values in this browser (demo)."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmingReset(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={reset}>
              Reset
            </Button>
          </>
        }
      />
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} className="mb-5" />
      {children}
    </Card>
  );
}

function TextInput({
  value,
  onChange,
  error = false,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  placeholder?: string;
}) {
  return (
    <UITextInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      placeholder={placeholder}
    />
  );
}

function TextArea({
  value,
  onChange,
  error = false,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}) {
  return (
    <UITextArea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      error={error}
    />
  );
}

function NumberInput({
  value,
  onChange,
  error = false,
}: {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
}) {
  return (
    <UITextInput
      type="number"
      min={1}
      value={value}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      error={error}
    />
  );
}