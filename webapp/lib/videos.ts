import type { Locale } from "@/lib/locales";
import type { CategorySlug, Localized } from "@/lib/news";
import { getCategoryName } from "@/lib/news";

export interface VideoSource {
  slug: string;
  category: CategorySlug;
  image: string;
  videoUrl: string;
  duration: Localized;
  views: string;
  featured: boolean;
  title: Localized;
  summary: Localized;
  publishedAt: Localized;
}

export interface Video {
  slug: string;
  category: CategorySlug;
  categoryName: string;
  image: string;
  videoUrl: string;
  duration: string;
  views: string;
  featured: boolean;
  title: string;
  summary: string;
  publishedAt: string;
}

export const videoSources: VideoSource[] = [
  {
    slug: "cricket-test-highlights-day-one",
    category: "sports",
    image: "https://picsum.photos/seed/video-cricket/1200/675",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: { bn: "৪:২০", en: "4:20" },
    views: "২৮,৭০০",
    featured: true,
    title: {
      bn: "ভারত-বাংলাদেশ টেস্ট: প্রথম দিনের সেরা মুহূর্তগুলো এক নজরে",
      en: "India-Bangladesh Test: day one's best moments in a glance",
    },
    summary: {
      bn: "লিটনের ঝড়ো ইনিংস, তাসকিনের গতি—প্রথম দিনের প্রতিটি প্রাণবন্ত মুহূর্ত ভিডিওতে।",
      en: "Litton's blazing knock and Taskin's pace — every lively moment from day one on video.",
    },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, বিকাল ৫:৩০",
      en: "Monday, 15 September 2026, 5:30 PM",
    },
  },
  {
    slug: "budget-analysis-inflation",
    category: "economy",
    image: "https://picsum.photos/seed/video-budget/1200/675",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: { bn: "৩:৪৫", en: "3:45" },
    views: "১৯,৪০০",
    featured: false,
    title: {
      bn: "নতুন বাজেটে মূল্যস্ফীতি ঠেকাতে যা যা আসছে",
      en: "What the new budget brings to tame inflation",
    },
    summary: {
      bn: "অর্থমন্ত্রীর ঘোষণা থেকে ভর্তুকি, সরবরাহ শৃঙ্খল ও ঋণ নীতির বিশদ আলোচনা।",
      en: "From the finance minister's announcements to subsidies, supply chains and credit policy.",
    },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, বিকাল ৪:৪৫",
      en: "Monday, 15 September 2026, 4:45 PM",
    },
  },
  {
    slug: "concert-highlights-grand-night",
    category: "entertainment",
    image: "https://picsum.photos/seed/video-concert/1200/675",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: { bn: "২:১০", en: "2:10" },
    views: "৩৩,২৫০",
    featured: false,
    title: {
      bn: "গানের রাত: মঞ্চের সেই দুর্দান্ত মুহূর্তগুলো",
      en: "Ganer Raat: the dazzling moments from the stage",
    },
    summary: {
      bn: "শীর্ষ শিল্পীদের অভিনব পারফরম্যান্স, আলোকসজ্জার জাদু—সবই এই ভিডিও সংকলনে।",
      en: "Standout performances from top artistes and the magic of the lights — all in this video roundup.",
    },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, বিকাল ৩:২০",
      en: "Monday, 15 September 2026, 3:20 PM",
    },
  },
  {
    slug: "smartphone-review-budget",
    category: "technology",
    image: "https://picsum.photos/seed/video-phone/1200/675",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    duration: { bn: "৫:০৫", en: "5:05" },
    views: "১৭,৮৮০",
    featured: false,
    title: {
      bn: "৯ হাজার টাকার ৫জি স্মার্টফোন—হাতেকলমে রিভিউ",
      en: "Hands-on review of the Tk 9,000 5G smartphone",
    },
    summary: {
      bn: "ক্যামেরা, ব্যাটারি ও পারফরম্যান্স—সাশ্রয়ী ডিভাইসটি আসলেই কেমন, দেখলাম হাতে।",
      en: "Camera, battery and performance — we get hands-on with the budget device to see how it really holds up.",
    },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, দুপুর ২:১০",
      en: "Monday, 15 September 2026, 2:10 PM",
    },
  },
  {
    slug: "padma-industrial-zone-tour",
    category: "national",
    image: "https://picsum.photos/seed/video-padma/1200/675",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    duration: { bn: "৩:৩০", en: "3:30" },
    views: "১২,৪০০",
    featured: false,
    title: {
      bn: "পদ্মা সেতু অঞ্চলে গড়ে উঠছে নতুন শিল্পাঞ্চল—ভিডিও প্রতিবেদন",
      en: "Video report: a new industrial zone rises around the Padma Bridge",
    },
    summary: {
      bn: "জমি অধিগ্রহণ থেকে সম্ভাব্য বিনিয়োগ—শিল্পাঞ্চলের চলমান কাজের চিত্র।",
      en: "From land acquisition to planned investment — a look at the zone taking shape.",
    },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, দুপুর ১২:৪৫",
      en: "Monday, 15 September 2026, 12:45 PM",
    },
  },
  {
    slug: "climate-summit-agreement-report",
    category: "international",
    image: "https://picsum.photos/seed/video-climate/1200/675",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: { bn: "৪:১৫", en: "4:15" },
    views: "১৫,৯৩০",
    featured: false,
    title: {
      bn: "জলবায়ু সম্মেলনের ঐতিহাসিক চুক্তি—তহবিল পৌঁছাবে কীভাবে?",
      en: "The historic climate deal — how will the funds reach vulnerable nations?",
    },
    summary: {
      bn: "২৫ হাজার কোটি ডলারের তহবিল বিতরণের স্বচ্ছ প্রক্রিয়া নিয়ে আলোচনা ও বিশ্লেষণ।",
      en: "Discussion and analysis of a transparent process for disbursing the $250 billion fund.",
    },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ১১:৩০",
      en: "Monday, 15 September 2026, 11:30 AM",
    },
  },
  {
    slug: "football-match-tactics-analysis",
    category: "sports",
    image: "https://picsum.photos/seed/video-football/1200/675",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    duration: { bn: "২:৫০", en: "2:50" },
    views: "২১,১৮০",
    featured: false,
    title: {
      bn: "প্রিমিয়ার লিগ: শেষ বাঁশিতে জেতা লেস্টারের কৌশল বিশ্লেষণ",
      en: "Premier League: tactical analysis of Leicester's late win",
    },
    summary: {
      bn: "৮৯তম মিনিটের সেই হেডার গোলে গড়ে উঠেছিল কী—নতুন করে দেখলাম রিপ্লেতে।",
      en: "We revisit the replays of that 89th-minute header and the shape that built it.",
    },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ১০:১৫",
      en: "Monday, 15 September 2026, 10:15 AM",
    },
  },
  {
    slug: "night-river-cruise-dhaka",
    category: "lifestyle",
    image: "https://picsum.photos/seed/video-cruise/1200/675",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    duration: { bn: "৩:১২", en: "3:12" },
    views: "৯,৭৬০",
    featured: false,
    title: {
      bn: "রাতের নদী ভ্রমণ: বুড়িগঙ্গার আলোকিত পাড় থেকে",
      en: "Night river cruise: from the illuminated banks of the Buriganga",
    },
    summary: {
      bn: "ঢাকার ব্যস্ততা থেকে মুহূর্তের পালান—নৌকায় রাত কাটানোর অনুভূতি ভিডিও প্রতিবেদনে।",
      en: "A brief escape from Dhaka's bustle — what a night on the water feels like, in this video report.",
    },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ৯:০০",
      en: "Monday, 15 September 2026, 9:00 AM",
    },
  },
];

function localizeVideo(video: VideoSource, locale: Locale): Video {
  return {
    slug: video.slug,
    category: video.category,
    categoryName: getCategoryName(video.category, locale),
    image: video.image,
    videoUrl: video.videoUrl,
    duration: video.duration[locale],
    views: video.views,
    featured: video.featured,
    title: video.title[locale],
    summary: video.summary[locale],
    publishedAt: video.publishedAt[locale],
  };
}

export function getVideos(locale: Locale): Video[] {
  return videoSources.map((video) => localizeVideo(video, locale));
}

export function getVideoBySlug(
  slug: string,
  locale: Locale,
): Video | undefined {
  const source = videoSources.find((video) => video.slug === slug);
  return source ? localizeVideo(source, locale) : undefined;
}

export function getFeaturedVideos(locale: Locale): Video[] {
  return getVideos(locale).filter((video) => video.featured);
}

export function getRelatedVideos(
  video: Video,
  locale: Locale,
): Video[] {
  return getVideos(locale)
    .filter(
      (candidate) =>
        candidate.category === video.category && candidate.slug !== video.slug,
    )
    .slice(0, 6);
}