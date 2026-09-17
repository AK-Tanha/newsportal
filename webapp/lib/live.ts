import type { Locale } from "@/lib/locales";
import type { CategorySlug, Localized } from "@/lib/news";
import { getCategoryName } from "@/lib/news";

export type LiveStatus = "live" | "offline";

export interface LiveStreamSource {
  slug: string;
  category: CategorySlug;
  title: Localized;
  description: Localized;
  streamUrl: string | null;
  poster: string;
  status: LiveStatus;
  startedAt: Localized;
  viewers: string;
}

export interface LiveStream {
  slug: string;
  category: CategorySlug;
  categoryName: string;
  title: string;
  description: string;
  streamUrl: string | null;
  poster: string;
  status: LiveStatus;
  startedAt: string;
  viewers: string;
}

export const liveStreamSources: LiveStreamSource[] = [
  {
    slug: "daily-bulletin-live",
    category: "national",
    streamUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster: "https://picsum.photos/seed/live-bulletin/1200/675",
    status: "live",
    viewers: "১৮,২৫০",
    title: {
      bn: "দৈনিক বুলেটিন: জাতীয়-আন্তর্জাতিক শীর্ষ সংবাদ এখনই",
      en: "Daily bulletin: top national and international headlines right now",
    },
    description: {
      bn: "দৈনিক রুদ্রখবরের নিয়মিত লাইভ সম্প্রচার। দিনভর আপডেট সংবাদ, বিশেষজ্ঞ বিশ্লেষণ ও ঘটনাপ্রবাহের সরাসরি চিত্র।",
      en: "The regular live broadcast of Daily Rudro Khobor — round-the-clock news updates, expert analysis and on-the-ground reporting.",
    },
    startedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ৯:০০",
      en: "Monday, 15 September 2026, 9:00 AM",
    },
  },
  {
    slug: "parliament-session-live",
    category: "politics",
    streamUrl: null,
    poster: "https://picsum.photos/seed/live-parliament/1200/675",
    status: "offline",
    viewers: "০",
    title: {
      bn: "সংসদ অধিবেশনের লাইভ সম্প্রচার",
      en: "Live broadcast of the parliament session",
    },
    description: {
      bn: "জাতীয় সংসদের অধিবেশনের সরাসরি সম্প্রচার। বর্তমানে সম্প্রচার বন্ধ—পরবর্তী অধিবেশনের সময়সূচি ঘোষণা করা হলে এখানে দেখা যাবে।",
      en: "Live coverage of the National Parliament session. Broadcasting is currently off — it will appear here once the next session is scheduled.",
    },
    startedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, বিকাল ৩:০০",
      en: "Monday, 15 September 2026, 3:00 PM",
    },
  },
];

export const activeLiveStreamSlug: string | null = "daily-bulletin-live";

function localizeStream(stream: LiveStreamSource, locale: Locale): LiveStream {
  return {
    slug: stream.slug,
    category: stream.category,
    categoryName: getCategoryName(stream.category, locale),
    title: stream.title[locale],
    description: stream.description[locale],
    streamUrl: stream.streamUrl,
    poster: stream.poster,
    status: stream.status,
    startedAt: stream.startedAt[locale],
    viewers: stream.viewers,
  };
}

export function getLiveStream(locale: Locale): LiveStream | null {
  if (!activeLiveStreamSlug) return null;
  const source = liveStreamSources.find(
    (stream) => stream.slug === activeLiveStreamSlug,
  );
  return source ? localizeStream(source, locale) : null;
}