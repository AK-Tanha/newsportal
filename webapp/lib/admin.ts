import { adSources, type AdType } from "@/lib/ads";
import type { CategorySlug, Article } from "@/lib/news";
import { articleSources, getArticles } from "@/lib/news";
import type { Video } from "@/lib/videos";
import { getVideos, videoSources } from "@/lib/videos";
import type { LiveStatus } from "@/lib/live";
import { activeLiveStreamSlug, liveStreamSources } from "@/lib/live";
import type { Locale } from "@/lib/locales";

const adminLocale: Locale = "en";

const mockDraftArticles = 3;

export const adminNavItems = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "articles", label: "Articles", href: "/admin/articles" },
  { key: "videos", label: "Videos", href: "/admin/videos" },
  { key: "live", label: "Live News", href: "/admin/live" },
  { key: "advertisements", label: "Advertisements", href: "/admin/ads" },
  { key: "media", label: "Media", href: "/admin/media" },
  { key: "settings", label: "Settings", href: "/admin/settings" },
] as const;

export type AdminNavKey = (typeof adminNavItems)[number]["key"];

export const adminAppInfo = {
  brandName: "রুদ্রখবর",
  panelLabel: "Newsroom Admin",
  viewSiteLabel: "View site",
  copyrightLabel: "© 2026 Daily Rudro Khobor — Newsroom Admin",
};

export const adminUser = {
  name: "Rayhan Hossain",
  role: "Editor",
  initials: "RH",
};

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalVideos: number;
  activeAdvertisements: number;
  liveStatus: LiveStatus;
}

export interface LiveStreamSummary {
  title: string;
  status: LiveStatus;
  category: CategorySlug;
  startedAt: string;
  viewers: string;
}

export interface AdvertisementSummary {
  slug: string;
  title: string;
  type: AdType;
  sponsored: boolean;
  placementsCount: number;
}

export function getDashboardStats(): DashboardStats {
  const totalArticles = articleSources.length;
  return {
    totalArticles,
    publishedArticles: totalArticles - mockDraftArticles,
    draftArticles: mockDraftArticles,
    totalVideos: videoSources.length,
    activeAdvertisements: adSources.length,
    liveStatus: getCurrentLiveStream()?.status ?? "offline",
  };
}

export function getRecentArticles(count = 5): Article[] {
  return getArticles(adminLocale).slice(0, count);
}

export function getRecentVideos(count = 4): Video[] {
  return getVideos(adminLocale).slice(0, count);
}

export function getCurrentLiveStream(): LiveStreamSummary | null {
  const source = liveStreamSources.find(
    (stream) => stream.slug === activeLiveStreamSlug,
  );
  if (!source) return null;
  return {
    title: source.title[adminLocale],
    status: source.status,
    category: source.category,
    startedAt: source.startedAt[adminLocale],
    viewers: source.viewers,
  };
}

export function getAdvertisementOverviews(count = 5): AdvertisementSummary[] {
  return adSources.slice(0, count).map((ad) => ({
    slug: ad.slug,
    title: ad.title[adminLocale],
    type: ad.type,
    sponsored: Boolean(ad.sponsored),
    placementsCount: ad.placements.length,
  }));
}