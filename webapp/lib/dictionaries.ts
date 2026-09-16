import type { Locale } from "@/lib/locales";

export interface Dictionary {
  brandHi: string;
  brandLo: string;
  tagline: string;
  date: string;
  printEdition: string;
  epaper: string;
  searchPlaceholder: string;
  home: string;
  breaking: string;
  more: string;
  moreNews: string;
  latestNews: string;
  mostRead: string;
  relatedNews: string;
  categories: string;
  readers: string;
  newsletterTitle: string;
  newsletterDesc: string;
  newsletterEmail: string;
  readMinutes: string;
  viewsLabel: string;
  otherCategories: string;
  techBlurb: string;
  notFoundTitle: string;
  notFoundDesc: string;
  backHome: string;
  footerAbout: string;
  footerSections: string;
  footerHelp: string;
  aboutUs: string;
  contact: string;
  advertise: string;
  privacy: string;
  copyright: string;
  editor: string;
  advertisement: string;
  sponsored: string;
  closeAd: string;
}

const bn: Dictionary = {
  brandHi: "দৈনিক",
  brandLo: "রুদ্রখবর",
  tagline: "সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম",
  date: "মঙ্গলবার, ১৫ সেপ্টেম্বর ২০২৬",
  printEdition: "প্রিন্ট সংস্করণ",
  epaper: "ই-পেপার",
  searchPlaceholder: "খুঁজুন...",
  home: "হোম",
  breaking: "সর্বশেষ",
  more: "আরও",
  moreNews: "আরও খবর",
  latestNews: "সর্বশেষ সংবাদ",
  mostRead: "সর্বাধিক পঠিত",
  relatedNews: "সম্পর্কিত খবর",
  categories: "বিভাগসমূহ",
  readers: "পাঠক",
  newsletterTitle: "নিউজলেটার পেতে সাবস্ক্রাইব করুন",
  newsletterDesc: "প্রতিদিন সকালে আপনার ইমেইলে সর্বশেষ সংবাদ পৌঁছে যাবে।",
  newsletterEmail: "newsletter@rudrokhobor.com",
  readMinutes: "পড়া",
  viewsLabel: "পাঠ",
  otherCategories: "অন্যান্য বিভাগ",
  techBlurb:
    "তথ্যপ্রযুক্তিতে যুক্ত হচ্ছে কৃত্রিম বুদ্ধিমত্তা। দেখুন প্রযুক্তি বিভাগ।",
  notFoundTitle: "খুঁজে পাওয়া যায়নি",
  notFoundDesc: "আপনি যে পাতাটি খুঁজছেন তা নেই বা সরিয়ে ফেলা হয়েছে।",
  backHome: "হোমপেজে ফিরে যান",
  footerAbout:
    "বস্তুনিষ্ঠ ও নিরপেক্ষ সংবাদ পরিবেশনের অঙ্গীকার নিয়ে পাঠকদের কাছে প্রতিনিয়ত সত্যনিষ্ঠ ও ক্ষণপ্রতি আপডেট পৌঁছে দিচ্ছে দৈনিক রুদ্রখবর। দেশ ও বিদেশের সর্বশেষ খবর, খেলাধুলা, বিনোদন, অর্থনীতি ও লাইফস্টাইল—সব এক ঠিকানায়।",
  footerSections: "বিভাগ",
  footerHelp: "সহায়তা",
  aboutUs: "আমাদের সম্পর্কে",
  contact: "যোগাযোগ",
  advertise: "বিজ্ঞাপন",
  privacy: "গোপনীয়তা নীতি",
  copyright: "© ২০২৬ সর্বস্বত্ব সংরক্ষিত | দৈনিক রুদ্রখবর",
  editor: "সম্পাদক: রায়হান হোসেন",
  advertisement: "বিজ্ঞাপন",
  sponsored: "স্পনসর্ড",
  closeAd: "বন্ধ করুন",
}

const en: Dictionary = {
  brandHi: "Daily",
  brandLo: "Rudro Khobor",
  tagline: "Truth, facts and a bold voice — ceaselessly on",
  date: "Tuesday, 15 September 2026",
  printEdition: "Print Edition",
  epaper: "E-Paper",
  searchPlaceholder: "Search...",
  home: "Home",
  breaking: "Latest",
  more: "More",
  moreNews: "More News",
  latestNews: "Latest News",
  mostRead: "Most Read",
  relatedNews: "Related News",
  categories: "Categories",
  readers: "readers",
  newsletterTitle: "Subscribe to our newsletter",
  newsletterDesc: "Get the latest news delivered to your inbox every morning.",
  newsletterEmail: "newsletter@rudrokhobor.com",
  readMinutes: "read",
  viewsLabel: "views",
  otherCategories: "Other Categories",
  techBlurb:
    "Artificial intelligence is joining technology services. Explore the Technology section.",
  notFoundTitle: "Not found",
  notFoundDesc: "The page you are looking for does not exist or has been removed.",
  backHome: "Back to Home",
  footerAbout:
    "True to its promise of impartial and honest journalism, Daily Rudro Khobor delivers truthful, minute-by-minute updates. National, sports, entertainment, business and lifestyle — all in one place.",
  footerSections: "Sections",
  footerHelp: "Help",
  aboutUs: "About Us",
  contact: "Contact",
  advertise: "Advertise",
  privacy: "Privacy Policy",
  copyright: "© 2026 All Rights Reserved | Daily Rudro Khobor",
  editor: "Editor: Rayhan Hossain",
  advertisement: "Advertisement",
  sponsored: "Sponsored",
  closeAd: "Close",
};

const dictionaries: Record<Locale, Dictionary> = { bn, en };

export function getDictionaryStatic(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export { dictionaries };