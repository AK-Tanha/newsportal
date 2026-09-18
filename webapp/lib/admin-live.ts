import {
  activeLiveStreamSlug,
  liveStreamSources,
  type LiveStatus,
} from "@/lib/live";
import type { CategorySlug } from "@/lib/news";

export interface CmsLiveStream {
  slug: string;
  category: CategorySlug;
  title: string;
  description: string;
  streamUrl: string | null;
  poster: string;
  status: LiveStatus;
  startedAt: string;
  viewers: string;
}

export interface CmsLiveStreamInput {
  category: CategorySlug;
  title: string;
  description: string;
  streamUrl: string | null;
  poster: string;
  status: LiveStatus;
  startedAt: string;
  viewers: string;
}

const latinDigits: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

function toLatinDigits(value: string): string {
  return value.replace(/[০-৯]/g, (digit) => latinDigits[digit] ?? digit);
}

const DEFAULT_POSTER = "https://picsum.photos/seed/live-bulletin/1200/675";

export function getDefaultCmsLiveStream(): CmsLiveStream {
  const source =
    liveStreamSources.find((stream) => stream.slug === activeLiveStreamSlug) ??
    liveStreamSources[0];
  return {
    slug: source.slug,
    category: source.category,
    title: source.title.en,
    description: source.description.en,
    streamUrl: source.streamUrl,
    poster: source.poster,
    status: source.status,
    startedAt: "2026-09-15T09:00",
    viewers: toLatinDigits(source.viewers),
  };
}

export function createBlankCmsLiveStream(): CmsLiveStream {
  return {
    slug: "live-stream-new",
    category: "national",
    title: "",
    description: "",
    streamUrl: null,
    poster: DEFAULT_POSTER,
    status: "offline",
    startedAt: "",
    viewers: "0",
  };
}

export function liveStatusLabel(status: LiveStatus): string {
  return status === "live" ? "LIVE" : "OFFLINE";
}

export function formatDateTime(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}