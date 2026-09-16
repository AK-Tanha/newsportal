import type { Locale } from "@/lib/locales";
import type { Localized } from "@/lib/news";

export type AdType = "banner" | "text" | "sponsored";

export type AdPlacement =
  | "header"
  | "below-hero"
  | "sidebar"
  | "in-feed"
  | "in-content"
  | "popup";

export interface AdSource {
  slug: string;
  type: AdType;
  placements: AdPlacement[];
  image?: string;
  link: Localized;
  title: Localized;
  description?: Localized;
  sponsored?: boolean;
}

export interface Ad {
  slug: string;
  type: AdType;
  placements: AdPlacement[];
  image?: string;
  link: string;
  title: string;
  description?: string;
  sponsored?: boolean;
}

export const adSources: AdSource[] = [
  {
    slug: "grameen-phone-5g",
    type: "banner",
    placements: ["header", "below-hero"],
    image: "https://picsum.photos/seed/ad-telecom/1200/400",
    link: { bn: "https://example.com/grameen-phone", en: "https://example.com/grameen-phone" },
    title: {
      bn: "গ্রামীণফোন ৫জি এখন সারা দেশে",
      en: "Grameenphone 5G now nationwide",
    },
    description: {
      bn: "দ্রুততম ইন্টারনেট উপভোগ করুন সবচেয়ে সাশ্রয়ী প্যাকেজে।",
      en: "Enjoy the fastest internet at the most affordable packages.",
    },
  },
  {
    slug: "banglalink-mega-sale",
    type: "banner",
    placements: ["in-content"],
    image: "https://picsum.photos/seed/ad-sale/1200/400",
    link: { bn: "https://example.com/banglalink", en: "https://example.com/banglalink" },
    title: {
      bn: "বাংলালিংক মেগা সেল: ৫০% ডিসকাউন্ট",
      en: "Banglalink mega sale: 50% off",
    },
    description: {
      bn: "রিচার্জেই জিতে নিন দারুণ সব অফার।",
      en: "Recharge and win exciting offers.",
    },
  },
  {
    slug: "city-bank-digital-banking",
    type: "text",
    placements: ["sidebar", "in-feed"],
    link: { bn: "https://example.com/city-bank", en: "https://example.com/city-bank" },
    title: {
      bn: "সিটি ব্যাংক ডিজিটাল ব্যাংকিং",
      en: "City Bank digital banking",
    },
    description: {
      bn: "৩০ সেকেন্ডে অ্যাকাউন্ট খুলুন, সার্বক্ষণিক মোবাইল ব্যাংকিং।",
      en: "Open an account in 30 seconds with 24/7 mobile banking.",
    },
  },
  {
    slug: "beximco-health",
    type: "text",
    placements: ["sidebar"],
    link: { bn: "https://example.com/beximco", en: "https://example.com/beximco" },
    title: {
      bn: "বেক্সিমকো হেলথ সার্ভিস",
      en: "Beximco health services",
    },
    description: {
      bn: "স্বাস্থ্য পরামর্শ ও চিকিৎসা সেবা এখন আপনার দোরগোড়ায়।",
      en: "Health advice and care now at your doorstep.",
    },
  },
  {
    slug: "dutch-bangla-cashback",
    type: "text",
    placements: ["in-feed", "sidebar"],
    link: { bn: "https://example.com/dutch-bangla", en: "https://example.com/dutch-bangla" },
    title: {
      bn: "ডাচ-বাংলা ক্যাশব্যাক অফার",
      en: "Dutch-Bangla cashback offer",
    },
    description: {
      bn: "প্রতিটি লেনদেনে বোনাস ক্যাশব্যাক, সীমাহীন সুবিধা।",
      en: "Bonus cashback on every transaction, unlimited rewards.",
    },
  },
  {
    slug: "tech-startup-spotlight",
    type: "sponsored",
    placements: ["in-feed"],
    image: "https://picsum.photos/seed/ad-startup/1200/400",
    link: { bn: "https://example.com/tech-startup", en: "https://example.com/tech-startup" },
    title: {
      bn: "বাংলাদেশের স্টার্টআপগুলোতে যে ট্রেন্ড বদলে দিচ্ছে বাজার",
      en: "The trend reshaping Bangladesh's startup market",
    },
    description: {
      bn: "স্পনসর্ড: কীভাবে ফিনটেক স্টার্টআপগুলো গ্রামীণ অর্থনীতিকে নতুন গল্প লিখছে।",
      en: "Sponsored: How fintech startups are writing a new story for the rural economy.",
    },
    sponsored: true,
  },
  {
    slug: "podcast-launch-popup",
    type: "banner",
    placements: ["popup"],
    image: "https://picsum.photos/seed/ad-podcast/1200/400",
    link: { bn: "https://example.com/podcast", en: "https://example.com/podcast" },
    title: {
      bn: "দৈনিক রুদ্রখবর পডকাস্ট: প্রতিদিন সকালে ১০ মিনিটের শীর্ষ সংবাদ",
      en: "Daily Rudro Khobor Podcast: Top news in 10 minutes every morning",
    },
    description: {
      bn: "চাকরি, অর্থনীতি ও দেশের খবর — এক কাপ চায়ের সঙ্গে শুনুন আজকের সারসংক্ষেপ।",
      en: "Jobs, economy and national news — today's briefing with your morning tea.",
    },
  },
];

export function localizeAd(ad: AdSource, locale: Locale): Ad {
  const title = ad.title ? ad.title[locale] : ad.title;
  const description = ad.description ? ad.description[locale] : ad.description;
  const link = ad.link ? ad.link[locale] : ad.link;
  return {
    ...ad,
    title,
    description,
    link,
  };
}

export function getAdsByPlacement(
  placement: AdPlacement,
  locale: Locale,
): Ad[] {
  return adSources
    .filter((ad) => ad.placements.includes(placement))
    .map((ad) => localizeAd(ad, locale));
}