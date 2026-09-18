import { liveStreamSources } from "@/lib/live";

export interface CmsSettings {
  siteNameBn: string;
  siteNameEn: string;
  taglineBn: string;
  taglineEn: string;
  logoUrl: string;
  faviconUrl: string;
  newsletterEmail: string;
  editorNameBn: string;
  editorNameEn: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  latestArticlesCount: number;
  mostReadCount: number;
  breakingMaxItems: number;
  defaultLiveSlug: string;
  metaTitleBn: string;
  metaTitleEn: string;
  metaDescriptionBn: string;
  metaDescriptionEn: string;
  ogImageUrl: string;
  metadataBaseUrl: string;
}

export const liveStreamOptions = liveStreamSources.map((stream) => ({
  value: stream.slug,
  label: stream.title.en,
}));

export function liveSlugLabel(slug: string): string {
  const match = liveStreamSources.find((stream) => stream.slug === slug);
  return match ? match.title.en : "None";
}

export function getDefaultCmsSettings(): CmsSettings {
  return {
    siteNameBn: "দৈনিক রুদ্রখবর",
    siteNameEn: "Daily Rudro Khobor",
    taglineBn: "সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম",
    taglineEn: "Truth, facts and a bold voice — ceaselessly on",
    logoUrl: "/logo.png",
    faviconUrl: "/icon.png",
    newsletterEmail: "newsletter@rudrokhobor.com",
    editorNameBn: "রায়হান হোসেন",
    editorNameEn: "Rayhan Hossain",
    facebookUrl: "https://facebook.com",
    twitterUrl: "https://twitter.com",
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
    latestArticlesCount: 8,
    mostReadCount: 5,
    breakingMaxItems: 10,
    defaultLiveSlug: "daily-bulletin-live",
    metaTitleBn: "দৈনিক রুদ্রখবর | সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম",
    metaTitleEn: "Daily Rudro Khobor | Truth, facts and a bold voice — ceaselessly on",
    metaDescriptionBn:
      "সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম — দেশ ও বিদেশের সর্বশেষ খবর, জাতীয়, অর্থনীতি, আন্তর্জাতিক, খেলাধুলা, বিনোদন ও লাইফস্টাইল।",
    metaDescriptionEn:
      "Truth, facts and a bold voice — ceaselessly on. Latest national, economy, international, sports, entertainment and lifestyle news from Bangladesh and around the world.",
    ogImageUrl: "/logo.png",
    metadataBaseUrl: "https://rudrokhobor.example.com",
  };
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidUrlOrPath(value: string): boolean {
  if (value === "") return true;
  if (value.startsWith("/")) return true;
  return isValidHttpUrl(value);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidCount(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

export type SettingsErrors = Partial<Record<keyof CmsSettings, string>>;

export function validateSettings(settings: CmsSettings): SettingsErrors {
  const errors: SettingsErrors = {};

  if (!settings.siteNameBn.trim()) errors.siteNameBn = "Site name (বাংলা) is required.";
  if (!settings.siteNameEn.trim()) errors.siteNameEn = "Site name (English) is required.";
  if (!settings.taglineBn.trim()) errors.taglineBn = "Tagline (বাংলা) is required.";
  if (!settings.taglineEn.trim()) errors.taglineEn = "Tagline (English) is required.";

  if (!isValidUrlOrPath(settings.logoUrl)) errors.logoUrl = "Logo must be a valid URL or path.";
  if (!isValidUrlOrPath(settings.faviconUrl)) errors.faviconUrl = "Favicon must be a valid URL or path.";

  if (settings.newsletterEmail && !isValidEmail(settings.newsletterEmail)) {
    errors.newsletterEmail = "Enter a valid email address.";
  }

  const social = (
    field: keyof CmsSettings,
    value: string,
  ) => {
    if (value.trim() && !isValidHttpUrl(value.trim())) {
      errors[field] = "Enter a valid http(s) URL.";
    }
  };
  social("facebookUrl", settings.facebookUrl);
  social("twitterUrl", settings.twitterUrl);
  social("instagramUrl", settings.instagramUrl);
  social("youtubeUrl", settings.youtubeUrl);

  if (!isValidCount(settings.latestArticlesCount, 1, 50)) {
    errors.latestArticlesCount = "Use a whole number between 1 and 50.";
  }
  if (!isValidCount(settings.mostReadCount, 1, 20)) {
    errors.mostReadCount = "Use a whole number between 1 and 20.";
  }
  if (!isValidCount(settings.breakingMaxItems, 1, 20)) {
    errors.breakingMaxItems = "Use a whole number between 1 and 20.";
  }

  const liveKnown = liveStreamSources.some((stream) => stream.slug === settings.defaultLiveSlug);
  if (settings.defaultLiveSlug !== "" && !liveKnown) {
    errors.defaultLiveSlug = "Choose a configured live stream.";
  }

  if (!settings.metaTitleBn.trim()) errors.metaTitleBn = "Meta title (বাংলা) is required.";
  if (!settings.metaTitleEn.trim()) errors.metaTitleEn = "Meta title (English) is required.";
  if (!settings.metaDescriptionBn.trim()) errors.metaDescriptionBn = "Meta description (বাংলা) is required.";
  if (!settings.metaDescriptionEn.trim()) errors.metaDescriptionEn = "Meta description (English) is required.";
  if (!isValidUrlOrPath(settings.ogImageUrl)) errors.ogImageUrl = "Open Graph image must be a valid URL or path.";
  if (settings.metadataBaseUrl.trim() && !isValidHttpUrl(settings.metadataBaseUrl.trim())) {
    errors.metadataBaseUrl = "Enter a valid http(s) base URL.";
  }

  return errors;
}