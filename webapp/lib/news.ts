import type { Locale } from "@/lib/locales";

export type CategorySlug =
  | "national"
  | "politics"
  | "economy"
  | "international"
  | "sports"
  | "entertainment"
  | "technology"
  | "lifestyle";

export type Localized = Record<Locale, string>;

export interface CategorySource {
  slug: CategorySlug;
  name: Localized;
  color: string;
}

export interface ArticleSource {
  slug: string;
  category: CategorySlug;
  image: string;
  views: string;
  featured: boolean;
  breaking: boolean;
  title: Localized;
  summary: Localized;
  author: Localized;
  publishedAt: Localized;
  readTime: Localized;
  content: Localized[];
}

export interface Article {
  slug: string;
  category: CategorySlug;
  categoryName: string;
  image: string;
  views: string;
  featured: boolean;
  breaking: boolean;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  readTime: string;
  content: string[];
}

export const categories: CategorySource[] = [
  { slug: "national", name: { bn: "জাতীয়", en: "National" }, color: "#e2231a" },
  { slug: "politics", name: { bn: "রাজনীতি", en: "Politics" }, color: "#2563eb" },
  { slug: "economy", name: { bn: "অর্থনীতি", en: "Economy" }, color: "#059669" },
  {
    slug: "international",
    name: { bn: "আন্তর্জাতিক", en: "International" },
    color: "#7c3aed",
  },
  { slug: "sports", name: { bn: "খেলাধুলা", en: "Sports" }, color: "#ea580c" },
  {
    slug: "entertainment",
    name: { bn: "বিনোদন", en: "Entertainment" },
    color: "#db2777",
  },
  {
    slug: "technology",
    name: { bn: "প্রযুক্তি", en: "Technology" },
    color: "#0284c7",
  },
  { slug: "lifestyle", name: { bn: "লাইফস্টাইল", en: "Lifestyle" }, color: "#ca8a04" },
];

export const articleSources: ArticleSource[] = [
  {
    slug: "budget-deficit-reduction-plan",
    category: "economy",
    image: "https://picsum.photos/seed/economy-budget/1200/800",
    views: "১২,৪৫০",
    featured: true,
    breaking: false,
    title: {
      bn: "মূল্যস্ফীতি নিয়ন্ত্রণে সরকারের নতুন কৌশল ঘোষণা, বছরের শেষে মূল্যস্ফীতি দাঁড়াতে পারে ৬ শতাংশে",
      en: "Government unveils new strategy to tame inflation, rate could ease to 6% by year-end",
    },
    summary: {
      bn: "অর্থমন্ত্রী বলেছেন, খাদ্যপণ্যের সরবরাহ শৃঙ্খল কঠোর নজরদারিতে রাখা হচ্ছে। মধ্যবিত্তের ক্রয়ক্ষমতা রক্ষায় বিশেষ উদ্যোগ নেওয়া হয়েছে।",
      en: "The finance minister said the food supply chain is under strict watch, with special measures to protect middle-class purchasing power.",
    },
    author: { bn: "রাকিব হাসান", en: "Rakib Hasan" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ৯:০০",
      en: "Monday, 15 September 2026, 9:00 AM",
    },
    readTime: { bn: "৪ মিনিট", en: "4 min" },
    content: [
      {
        bn: "মূল্যস্ফীতি নিয়ন্ত্রণে সরকার একটি বহুমুখী কৌশল গ্রহণ করেছে বলে জানিয়েছেন অর্থমন্ত্রী। কৃষিপণ্যের সরবরাহ শৃঙ্খলে মধ্যস্বত্ত্বভোগী কমিয়ে আনার পাশাপাশি ভোক্তা অধিকার সংরক্ষণে কার্যকর পদক্ষেপ নেওয়া হচ্ছে।",
        en: "The finance minister has said the government has adopted a multi-pronged strategy to rein in inflation. Alongside trimming middlemen from the farm produce supply chain, effective steps are being taken to protect consumer rights.",
      },
      {
        bn: "অর্থ মন্ত্রণালয় সূত্রে জানা গেছে, আসন্ন বাজেটে খাদ্য নিরাপত্তা বাড়াতে ভর্তুকি ও সামাজিক নিরাপত্তা বেষ্টনী কর্মসূচির আওতা সম্প্রসারিত করা হবে। ঋণের সুদহার কমিয়ে ব্যবসা-বাণিজ্যে গতি আনারও পরিকল্পনা রয়েছে।",
        en: "According to the finance ministry, the upcoming budget will expand subsidies and the social safety-net programme to strengthen food security. There are also plans to lower lending rates to give business a push.",
      },
      {
        bn: "বিশ্লেষকরা বলছেন, সরবরাহ ব্যবস্থা স্বাভাবিক রাখতে পারলে বছরের শেষ নাগাদ মূল্যস্ফীতি ৬ শতাংশে নেমে আসতে পারে। তবে আন্তর্জাতিক বাজারে জ্বালানি তেলের দাম ওঠানামা ঝুঁকি হিসেবে থেকে যাচ্ছে।",
        en: "Analysts say inflation could fall to 6 percent by the end of the year if the supply system stays stable. Meanwhile, volatile international fuel prices remain a risk.",
      },
      {
        bn: "এদিকে জাতীয় রাজস্ব বোর্ড আমদানি-রপ্তানিতে ডিজিটাল প্ল্যাটফর্ম চালুর কাজ দ্রুত এগিয়ে নিচ্ছে। এটি ব্যবসায়ীদের সময় ও খরচ দুটোই কমাবে বলে মনে করছেন সংশ্লিষ্টরা।",
        en: "Meanwhile, the National Board of Revenue is fast-tracking a digital platform for imports and exports, which those involved say will cut both time and cost for traders.",
      },
    ],
  },
  {
    slug: "padma-bridge-industrial-zone",
    category: "economy",
    image: "https://picsum.photos/seed/economy-bridge/1200/800",
    views: "৯,৮৩০",
    featured: true,
    breaking: false,
    title: {
      bn: "পদ্মা সেতুপার এলাকায় নতুন শিল্পাঞ্চল, বিনিয়োগ আসছে ৪৫ হাজার কোটি টাকা",
      en: "New industrial zone around Padma Bridge draws Tk 45,000 crore in investment",
    },
    summary: {
      bn: "মুন্সীগঞ্জ ও ফরিদপুর জেলাকে ঘিরে গড়ে উঠছে নতুন অর্থনৈতিক অঞ্চল। চাকরি পাবে প্রায় ১০ লাখ মানুষ।",
      en: "A new economic zone is taking shape around Munshiganj and Faridpur, creating jobs for around one million people.",
    },
    author: { bn: "তানভীর আহমেদ", en: "Tanvir Ahmed" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ৮:৩০",
      en: "Monday, 15 September 2026, 8:30 AM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "পদ্মা সেতুর সংযোগ সড়ককে ঘিরে মুন্সীগঞ্জ ও ফরিদপুরে একটি বড় আকারের শিল্পাঞ্চল গড়ে তোলার উদ্যোগ নিয়েছে সরকার। বাংলাদেশ অর্থনৈতিক অঞ্চল কর্তৃপক্ষ এ লক্ষ্যে জমি অধিগ্রহণ শুরু করেছে।",
        en: "The government has moved to build a large industrial zone around the Padma Bridge corridor in Munshiganj and Faridpur. The Bangladesh Economic Zones Authority has begun acquiring land for the project.",
      },
      {
        bn: "সংশ্লিষ্ট কর্মকর্তারা জানান, প্রথম পর্যায়ে চার হাজার একর জমিতে গড়ে উঠবে ইলেকট্রনিক্স, গার্মেন্টস অ্যাকসেসরিজ ও প্রক্রিয়াজাত খাদ্য কারখানা। বিদেশি বিনিয়োগকারীরা ইতোমধ্যে আগ্রহ প্রকাশ করেছেন।",
        en: "In the first phase, electronics, garment-accessory and food-processing factories will rise on 4,000 acres. Foreign investors have already expressed interest.",
      },
      {
        bn: "অর্থনীতিবিদদের মতে, দক্ষিণ-পশ্চিমাঞ্চলের এই শিল্পায়ন মাদারীপুর, শরীয়তপুর ও বরিশাল অঞ্চলের মানুষের জীবনমান বদলে দেবে। স্থানীয়রা আশা করছেন, প্রবাসে যাওয়ার বদলে তারা নিজ এলাকায় কাজ করতে পারবেন।",
        en: "Economists say this industrialisation of the south-west will transform the lives of people in Madaripur, Shariatpur and Barishal. Locals hope to find work at home instead of going abroad.",
      },
    ],
  },
  {
    slug: "stock-market-record-high",
    category: "economy",
    image: "https://picsum.photos/seed/economy-stock/1200/800",
    views: "১৫,২০০",
    featured: false,
    breaking: true,
    title: {
      bn: "দুই বছরের মধ্যে সর্বোচ্চ উচ্চতায় পুঁজিবাজার, ডিএসই সূচক ছাড়াল ৭ হাজার পয়েন্ট",
      en: "Stock market at two-year high as DSE index crosses 7,000 points",
    },
    summary: {
      bn: "বিনিয়োগকারীদের আস্থা ফিরে আসায় প্রতিদিন লেনদেন বেড়েই চলেছে। ব্যাংক ও ফার্মা খাতের শেয়ার সবচেয়ে এগিয়ে।",
      en: "Daily trading keeps climbing as investor confidence returns, led by banking and pharmaceutical shares.",
    },
    author: { bn: "সাব্বির রহমান", en: "Sabbir Rahman" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ৮:১০",
      en: "Monday, 15 September 2026, 8:10 AM",
    },
    readTime: { bn: "২ মিনিট", en: "2 min" },
    content: [
      {
        bn: "ঢাকা স্টক এক্সচেঞ্জের প্রধান সূচক ডিএসইএক্স দুই বছরের মধ্যে প্রথমবারের মতো ৭ হাজার পয়েন্ট অতিক্রম করেছে। ব্যাংক, বস্ত্র ও ওষুধ খাতের শেয়ার দর বৃদ্ধিতে সূচক আশানুরূপ গতি পেয়েছে।",
        en: "The Dhaka Stock Exchange's benchmark index, DSEX, has crossed 7,000 points for the first time in two years. Banking, textile and pharmaceutical stocks led the surge.",
      },
      {
        bn: "বাজার-বিশ্লেষকরা বলেছেন, নীতি-সুদের হার কমে আসা এবং রাজনৈতিক স্থিতিশীলতা বিনিয়োগকারীদের মনোবল চাঙ্গা করেছে। প্রাতিষ্ঠানিক বিনিয়োগকারীদের পাশাপাশি খুচরা পর্যায়েও লেনদেন বেড়েছে।",
        en: "Market analysts say falling policy rates and political stability have boosted investor sentiment. Trading rose among both institutional and retail investors.",
      },
      {
        bn: "তবে সংশ্লিষ্টরা সতর্ক করে বলেছেন, সূচকের এই ঊর্ধ্বগতি ধরে রাখতে হলে জাল হোল্ডিং ও কারসাজি রোধে নিয়ন্ত্রকদের কঠোর নজরদারি অব্যাহত রাখতে হবে।",
        en: "However, stakeholders caution that sustaining this rally requires regulators to keep strict watch against fake holdings and market manipulation.",
      },
    ],
  },
  {
    slug: "national-parliament-new-session",
    category: "politics",
    image: "https://picsum.photos/seed/politics-parliament/1200/800",
    views: "৮,৭৬০",
    featured: false,
    breaking: false,
    title: {
      bn: "সংসদের নতুন অধিবেশন শুরু সোমবার, তিনটি গুরুত্বপূর্ণ বিল উত্থাপন হবে",
      en: "Parliament's new session opens Monday with three important bills",
    },
    summary: {
      bn: "ডিজিটাল নিরাপত্তা, শ্রম সংস্কার ও তৃণমূল প্রশাসন—এই তিনটি বিল এবারের অধিবেশনে আলোচনার কেন্দ্রবিন্দু।",
      en: "Digital security, labour reform and grassroots administration anchors this session's agenda.",
    },
    author: { bn: "নুসরাত জাহান", en: "Nusrat Jahan" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ৭:৫০",
      en: "Monday, 15 September 2026, 7:50 AM",
    },
    readTime: { bn: "৪ মিনিট", en: "4 min" },
    content: [
      {
        bn: "জাতীয় সংসদের নতুন অধিবেশন আগামী সোমবার শুরু হবে। সংসদ সচিবালয় সূত্রে জানা গেছে, এবারের অধিবেশনে মোট পাঁচটি বিল উত্থাপনের প্রস্তুতি নেওয়া হয়েছে। এর মধ্যে তিনটি বিল বিশেষ গুরুত্ব বহন করছে।",
        en: "Parliament's new session starts on Monday. According to the secretariat, five bills are set to be placed, three of which carry special significance.",
      },
      {
        bn: "ডিজিটাল নিরাপত্তা সংক্রান্ত বিলটি পাস হলে সাইবার অপরাধ দমনে কঠোর আইনি কাঠামো তৈরি হবে। অন্যদিকে শ্রম সংস্কার বিলে শ্রমিকদের ন্যূনতম মজুরি ও কর্মঘণ্টা পুনর্নির্ধারণের প্রস্তাব রাখা হয়েছে।",
        en: "The digital security bill, once passed, would create a strict legal framework against cybercrime. The labour reform bill proposes resetting minimum wages and working hours.",
      },
      {
        bn: "বিরোধী দলগুলোর নেতারা বলেছেন, বিলগুলোর বিষয়ে পর্যাপ্ত আলোচনার দাবি জানানো হবে। বিভিন্ন সেক্টরের প্রতিনিধিদের মতামত নেওয়ার পরই চূড়ান্ত অনুমোদন দেওয়ার আহ্বান জানিয়েছেন তারা।",
        en: "Opposition leaders say they will demand thorough debate, urging final approval only after hearing representatives from various sectors.",
      },
    ],
  },
  {
    slug: "upazila-election-schedule",
    category: "politics",
    image: "https://picsum.photos/seed/politics-election/1200/800",
    views: "১১,৩২০",
    featured: false,
    breaking: true,
    title: {
      bn: "৬৪ জেলায় উপজেলা নির্বাচনের প্রস্তুতিমূলক তালিকা প্রকাশ, ভোটগ্রহণ অক্টোবরে",
      en: "Preliminary schedule for upazila elections in 64 districts released, voting in October",
    },
    summary: {
      bn: "নির্বাচন কমিশন বলছে, ভোটারদের নতুন ছবিসহ পরিচয়পত্র যাচাইয়ের কাজ প্রায় সম্পন্ন। এবার ভোটের হার বাড়ানোর বিশেষ উদ্যোগ।",
      en: "The EC says verification of voters' photo IDs is nearly complete, with special drives to raise turnout.",
    },
    author: { bn: "মাহমুদুল করিম", en: "Mahmudul Karim" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ৭:৩০",
      en: "Monday, 15 September 2026, 7:30 AM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "দেশের ৬৪টি জেলায় উপজেলা পরিষদ নির্বাচন অনুষ্ঠানের প্রস্তুতিমূলক তালিকা প্রকাশ করেছে নির্বাচন কমিশন। আগামী অক্টোবরের প্রথম সপ্তাহে এ নির্বাচন অনুষ্ঠিত হওয়ার সম্ভাবনা রয়েছে।",
        en: "The Election Commission has released the preliminary schedule for upazila elections in all 64 districts. The polls are likely to be held in the first week of October.",
      },
      {
        bn: "নির্বাচন কমিশনাররা জানিয়েছেন, ভোটার তালিকা হালনাগাদ ও পরিচয়পত্রের ডিজিটাল যাচাইয়ের কাজ প্রায় শেষ। এবার অনলাইন ভোটার গণনা ও ফলাফল প্রকাশের ব্যবস্থাও রাখা হবে।",
        en: "Commissioners said updating voter rolls and digital ID verification are nearly done. Online vote counting and result publication will also be introduced.",
      },
      {
        bn: "রাজনৈতিক দলগুলো ইতোমধ্যে মনোনয়ন প্রক্রিয়া শুরু করলেও ক্ষমতাসীন ও বিরোধী পক্ষের মধ্যে শান্তিপূর্ণ নির্বাচনের প্রতিশ্রুতি রয়েছে। আইনশৃঙ্খলা রক্ষায় বিশেষ টাস্কফোর্স গঠন করা হবে বলে জানিয়েছে স্বরাষ্ট্র মন্ত্রণালয়।",
        en: "While parties have begun nomination processes, both ruling and opposition camps promise peaceful polls. The home ministry says a special taskforce will be formed to maintain order.",
      },
    ],
  },
  {
    slug: "parliament-leader-meeting-separatists",
    category: "politics",
    image: "https://picsum.photos/seed/politics-dialogue/1200/800",
    views: "৭,৫৪০",
    featured: false,
    breaking: false,
    title: {
      bn: "দলীয় কোন্দল নিরসনে দুই নেতার বৈঠক, রাজনৈতিক স্থিতিশীলতার ইতিবাচক বার্তা",
      en: "Leaders meet to resolve party frictions, a positive sign for political stability",
    },
    summary: {
      bn: "সরকার ও বিরোধী শিবিরের প্রতিনিধিরা একসঙ্গে বসে সংলাপ শুরু করেছেন। নির্বাচনী সংস্কার ইস্যুতে ঐক্যমত্যের চেষ্টা।",
      en: "Representatives of the government and opposition camps have opened a dialogue, seeking consensus on electoral reform.",
    },
    author: { bn: "ফারহানা আক্তার", en: "Farhana Akter" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, সকাল ৭:০০",
      en: "Monday, 15 September 2026, 7:00 AM",
    },
    readTime: { bn: "২ মিনিট", en: "2 min" },
    content: [
      {
        bn: "রাজনৈতিক দলগুলোর মধ্যে দীর্ঘদিনের কোন্দল নিরসনের লক্ষ্যে দুই প্রধান শক্তির প্রতিনিধিরা একটি বৈঠকে বসেছেন। বৈঠকটি প্রায় তিন ঘণ্টা ধরে চলে।",
        en: "Representatives of the two main forces have sat down to resolve long-running political friction. The meeting lasted nearly three hours.",
      },
      {
        bn: "বৈঠক সূত্রে জানা গেছে, নির্বাচন কমিশন সংস্কার, স্থানীয় সরকার নির্বাচন ও গণমাধ্যমের স্বাধীনতা ইস্যুতে আলোচনা হয়েছে। উভয় পক্ষই সংলাপের ধারাবাহিকতা বজায় রাখার প্রতিশ্রুতি দিয়েছেন।",
        en: "Sources said discussions covered EC reform, local government elections and press freedom. Both sides pledged to keep the dialogue going.",
      },
      {
        bn: "রাজনৈতিক বিশ্লেষকরা বলছেন, এই সংলাপ দেশের গণতান্ত্রিক প্রক্রিয়ার জন্য ইতিবাচক। তবে মার্জিত ভাষা ও পারস্পরিক শ্রদ্ধা বজায় রাখাটাই এখন মূল চ্যালেঞ্জ।",
        en: "Analysts call the dialogue a positive step for democracy, though the real challenge lies in maintaining mutual respect and decorum.",
      },
    ],
  },
  {
    slug: "international-climate-summit-agreement",
    category: "international",
    image: "https://picsum.photos/seed/intl-climate/1200/800",
    views: "২০,০৯০",
    featured: true,
    breaking: false,
    title: {
      bn: "জলবায়ু সম্মেলনে ঐতিহাসিক চুক্তি, উন্নত দেশগুলো দেবে ২৫ হাজার কোটি ডলার তহবিল",
      en: "Historic climate summit deal: developed nations to contribute $250 billion fund",
    },
    summary: {
      bn: "পরিবেশ ক্ষয়ক্ষতি মোকাবিলায় ক্ষতিগ্রস্ত দেশগুলোকে সহায়তার বাধ্যবাধকতা মানল শিল্পোন্নত দেশগুলো।",
      en: "Industrialised nations commit to support climate-vulnerable countries facing environmental losses.",
    },
    author: { bn: "আরিফুল ইসলাম", en: "Ariful Islam" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, ভোর ৬:৪০",
      en: "Monday, 15 September 2026, 6:40 AM",
    },
    readTime: { bn: "৫ মিনিট", en: "5 min" },
    content: [
      {
        bn: "জাতিসংঘের উদ্যোগে আয়োজিত বিশ্ব জলবায়ু সম্মেলনে ঐতিহাসিক একটি চুক্তি সই হয়েছে। চুক্তি অনুযায়ী ২০৩০ সালের মধ্যে উন্নত দেশগুলো জলবায়ু ক্ষতিগ্রস্ত উন্নয়নশীল দেশগুলোকে ২৫ হাজার কোটি ডলারের তহবিল দেবে।",
        en: "A landmark agreement was signed at the UN climate summit, under which developed nations will provide $250 billion to climate-vulnerable developing countries by 2030.",
      },
      {
        bn: "চুক্তিতে সমুদ্রপৃষ্ঠের উচ্চতা বৃদ্ধি বন্ধে কার্বন নিঃসরণ কমানোর কঠোর লক্ষ্যমাত্রাও নির্ধারণ করা হয়েছে। বিশেষ করে নিম্নভূমির দ্বীপরাষ্ট্রগুলো ও দক্ষিণ এশিয়ার ব-দ্বীপ অঞ্চলগুলোর জন্য এটি গুরুত্বপূর্ণ।",
        en: "The deal sets binding targets to cut emissions and halt sea-level rise, crucial for low-lying island states and South Asia's delta regions.",
      },
      {
        bn: "বাংলাদেশের প্রতিনিধি দল চুক্তিটিকে ঐতিহাসিক বলে অভিহিত করেছেন। তবে তারা বলেছেন, অর্থ বিতরণের স্বচ্ছ প্রক্রিয়া নিশ্চিত না হলে প্রকৃত সুফল পৌঁছাতে বিলম্ব হতে পারে।",
        en: "Bangladesh's delegation called the deal historic but warned that without transparent disbursement, real benefits may be delayed.",
      },
    ],
  },
  {
    slug: "us-china-trade-deal",
    category: "international",
    image: "https://picsum.photos/seed/intl-trade/1200/800",
    views: "১৩,৪০০",
    featured: false,
    breaking: false,
    title: {
      bn: "যুক্তরাষ্ট্র-চীন নতুন বাণিজ্য চুক্তিতে সম্মত, পণ্যের শুল্ক অর্ধেকে নামছে",
      en: "US and China strike new trade deal, tariffs on goods to be halved",
    },
    summary: {
      bn: "দুই অর্থনৈতিক পরাশক্তির মধ্যে উত্তেজনা কমে আসায় বৈশ্বিক বাজারে স্বস্তি। এতে উপকৃত হবে আমদানি নির্ভর দেশগুলো।",
      en: "Easing tensions between the two superpowers brings relief to global markets and import-dependent countries.",
    },
    author: { bn: "রাফিউল করিম", en: "Rafiul Karim" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, ভোর ৬:১০",
      en: "Monday, 15 September 2026, 6:10 AM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "বছরব্যাপী বাণিজ্য যুদ্ধের অবসান ঘটিয়ে যুক্তরাষ্ট্র ও চীন একটি নতুন বাণিজ্য চুক্তিতে স্বাক্ষর করেছে। চুক্তির আওতায় ৪৫ ধরনের পণ্যে শুল্ক অর্ধেক কমানো হবে।",
        en: "Ending a year-long trade war, the United States and China have signed a new agreement that halves tariffs on 45 product categories.",
      },
      {
        bn: "বিশ্লেষকদের মতে, এই চুক্তি বৈশ্বিক সরবরাহ শৃঙ্খলে স্থিতিশীলতা ফিরিয়ে আনবে। ফলে পণ্যের দাম মানুষের জন্য সাশ্রয়ী হয়ে উঠবে, বিশেষ করে সেমিকন্ডাক্টর ও চিকিৎসা উপকরণের ক্ষেত্রে।",
        en: "Analysts say the deal will restore stability to global supply chains, making goods cheaper — especially semiconductors and medical equipment.",
      },
      {
        bn: "বাংলাদেশের ব্যবসায়ী নেতারা বলেছেন, শুল্ক কমানোর ফলে লোকাল কারেন্সি স্ট্যাবিলাইজেশনসহ রপ্তানি ব্যয় কমে আসবে, যা এক্সপোর্ট সেক্টরে নতুন সম্ভাবনা তৈরি করবে।",
        en: "Bangladeshi business leaders say lower tariffs will cut export costs and strengthen local currency stability, opening new possibilities for the export sector.",
      },
    ],
  },
  {
    slug: "australia-recorded-heatwave",
    category: "international",
    image: "https://picsum.photos/seed/intl-heatwave/1200/800",
    views: "৬,৭৮০",
    featured: false,
    breaking: false,
    title: {
      bn: "অস্ট্রেলিয়ায় রেকর্ড তাপপ্রবাহ, কোথাও তাপমাত্রা ছুঁয়েছে ৫০ ডিগ্রি",
      en: "Record heatwave scorches Australia, temperatures touch 50°C in places",
    },
    summary: {
      bn: "জলবায়ু পরিবর্তনের সরাসরি প্রভাবে এই গ্রীষ্মে দেশটির নানা অঞ্চলে দাবানল ও খরা দেখা দিয়েছে।",
      en: "Driven by climate change, this summer has brought bushfires and drought to many parts of the country.",
    },
    author: { bn: "সুমাইয়া রহমান", en: "Sumaiya Rahman" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, ভোর ৫:৪০",
      en: "Monday, 15 September 2026, 5:40 AM",
    },
    readTime: { bn: "২ মিনিট", en: "2 min" },
    content: [
      {
        bn: "অস্ট্রেলিয়ার পশ্চিমাঞ্চলের কয়েকটি শহরে তাপমাত্রা ৫০ ডিগ্রি সেলসিয়াস ছাড়িয়ে গেছে, যা দেশটির ইতিহাসে রেকর্ড। আবহাওয়া অধিদপ্তর সতর্কবার্তা জারি করেছে।",
        en: "Temperatures surpassed 50°C in several western Australian towns, setting a national record. The weather bureau has issued warnings.",
      },
      {
        bn: "প্রচণ্ড গরমে স্কুলগুলো সাময়িক ছুটি ঘোষণা করেছে। জরুরি সেবার সংখ্যাও বেড়েছে। স্বাস্থ্য বিশেষজ্ঞরা বলেছেন, তাপপ্রবাহ জনস্বাস্থ্যের জন্য বড় হুমকি হয়ে দাঁড়িয়েছে।",
        en: "Schools have declared temporary closures and emergency calls have surged. Health experts call the heatwave a major public-health threat.",
      },
      {
        bn: "পরিবেশবিদরা বলছেন, কার্বন নিঃসরণ না কমালে এমন চরম আবহাওয়া আগামী দিনে আরও ঘন ঘন ঘটবে। বিশ্ব জনগোষ্ঠীর জন্য এটি এক অভিন্ন সংকটের ইঙ্গিত বহন করে।",
        en: "Environmentalists warn that without emission cuts, such extreme weather will become ever more frequent — a shared crisis for the whole world.",
      },
    ],
  },
  {
    slug: "bangladesh-test-series-india",
    category: "sports",
    image: "https://picsum.photos/seed/sports-cricket/1200/800",
    views: "৩৫,৪৩০",
    featured: true,
    breaking: true,
    title: {
      bn: "ভারতের বিপক্ষে সিরিজের প্রথম টেস্টে দারুণ শুরু টাইগারদের, লিটন ফিরেছেন জ্বলে ওঠার ছন্দে",
      en: "Tigers make flying start in first Test against India, Litton back in blazing form",
    },
    summary: {
      bn: "প্রথম দিনেই ঝড়ো ইনিংস খেলেছেন লিটন দাস। বোলারদের অগ্রভাগে তাসকিনের গতিতে রীতিমতো ব্যাকফুটে প্রতিপক্ষ।",
      en: "Litton Das struck a blazing innings on day one, while Taskin's pace kept the opposition on the back foot.",
    },
    author: { bn: "শফিকুল ইসলাম", en: "Shafiqul Islam" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, ভোর ৫:২০",
      en: "Monday, 15 September 2026, 5:20 AM",
    },
    readTime: { bn: "৪ মিনিট", en: "4 min" },
    content: [
      {
        bn: "ক্রিকেট মাঠে সোমবার সকাল থেকেই ছিল প্রাণবন্ত। ভারতের বিপক্ষে দুই ম্যাচ সিরিজের প্রথম টেস্টে দুর্দাশই শুরু করেছে বাংলাদেশ। ব্যাট হাতে লিটন দাস ফিরেছেন পুরোনো ছন্দে।",
        en: "The cricket ground buzzed from Monday morning as Bangladesh made a superb start in the first of two Tests against India. Litton Das rediscovered his golden touch with the bat.",
      },
      {
        bn: "প্রথম ইনিংসে ১৮৭ বলে ঝড়ো ১১২ রানের ইনিংস খেলেন লিটন। তাসকিন আহমেদ ও শরীফুল ইসলামের বোলিং তোপে তৃতীয় দিনের প্রথম সেশনে আইস বাংলার ইনিংস ৩৪৮ রানে থামে।",
        en: "Litton smashed a stormy 112 off 187 balls in the first innings. Thanks to the bowling of Taskin Ahmed and Shoriful Islam, India's innings closed at 348 in the first session of day three.",
      },
      {
        bn: "উদ্বোধনী জুটিতে এগিয়ে আসা সাঈম ও জাকির আধুনিক ক্রিকেটে ধৈর্যের পরিচয় দিয়েছেন। ক্রিকেট আমজনতার আশা, এই ফর্ম ধরে রাখতে পারলে সিরিজটি বাংলাদেশের দিকে ঝুঁকতে পারে।",
        en: "Openers Saime and Zakir showed great patience in modern cricket. Fans hope that if this form holds, the series could tilt Bangladesh's way.",
      },
    ],
  },
  {
    slug: "football-premier-league-result",
    category: "sports",
    image: "https://picsum.photos/seed/sports-football/1200/800",
    views: "২২,১০০",
    featured: false,
    breaking: false,
    title: {
      bn: "প্রিমিয়ার লিগে দুরন্ত জয়ে শীর্ষে আরও এক ধাপ এগোল লেস্টার, শেষ মুহূর্তের গোলে জয়",
      en: "Leicester edge closer to the top with a late winner in the Premier League",
    },
    summary: {
      bn: "ওল্ড ট্র্যাফোর্ডে ঘুরে দাঁড়ানোর পারফরম্যান্স দেখাল দলটি। ম্যাচের প্রথমার্ধে গোল পরাজয় মানিয়ে নিয়েই আক্রমণের ধার বাড়ায়।",
      en: "The side roared back at Old Trafford, shaking off an early deficit before turning up the attack.",
    },
    author: { bn: "জাহিদুল ইসলাম", en: "Jahidul Islam" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, ভোর ৪:৫০",
      en: "Monday, 15 September 2026, 4:50 AM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "ইংলিশ প্রিমিয়ার লিগের এই মৌসুমে চলছে লেস্টারের অভাবনীয় ছন্দ। শেষ ম্যাচে ওল্ড ট্র্যাফোর্ডে ম্যানচেস্টার ইউনাইটেডকে ২-১ গোলে হারিয়ে শীর্ষ চারে তাদের অবস্থান আরও দৃঢ় হয়েছে।",
        en: "Leicester continue their stunning rhythm this Premier League season, beating Manchester United 2-1 at Old Trafford to firm up their place in the top four.",
      },
      {
        bn: "ম্যাচের ৮৯তম মিনিটে ডিফেন্ডার জেমস জাস্টিনের হেডার গোলে জয় নিশ্চিত হয়। পুরো ম্যাচে লেস্টারের পজেশন ও আক্রমণে স্পষ্ট আধিপত্য দেখা যায়।",
        en: "A header from defender James Justin sealed the win in the 89th minute. Leicester dominated possession and attack throughout.",
      },
      {
        bn: "এই জয়ে লেস্টার ৭ ম্যাচে ১৭ পয়েন্ট নিয়ে এখন তৃতীয় স্থানে। কোচ বলেছেন, শিরোপার লড়াইয়ে থাকতে পারাই এখন মূল লক্ষ্য।",
        en: "The win lifts Leicester to third with 17 points from seven matches. The coach says staying in the title race is now the priority.",
      },
    ],
  },
  {
    slug: "bangladesh-world-cup-preparation",
    category: "sports",
    image: "https://picsum.photos/seed/sports-training/1200/800",
    views: "18,০৫০",
    featured: false,
    breaking: false,
    title: {
      bn: "বিশ্বকাপের আগে টাইগারদের জনপ্রিয় ক্যাম্পেইন, ফিটনেস ও মেন্টাল কোচিংয়ে জোর",
      en: "Tigers step up pre-World Cup training with focus on fitness and mental coaching",
    },
    summary: {
      bn: "এক মাসের প্রস্তুতি ক্যাম্পে যুক্ত হয়েছেন নতুন স্ট্রেংথ অ্যান্ড কন্ডিশনিং কোচ। অক্টোবরেই আসরে নামছে জাতীয় ক্রিকেট দল।",
      en: "A new strength-and-conditioning coach has joined the month-long camp ahead of the October tournament.",
    },
    author: { bn: "মেহেদী হাসান", en: "Mehedi Hasan" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, ভোর ৪:৩০",
      en: "Monday, 15 September 2026, 4:30 AM",
    },
    readTime: { bn: "২ মিনিট", en: "2 min" },
    content: [
      {
        bn: "আগামী ক্রিকেট বিশ্বকাপের আগে নিজেদের প্রস্তুতি সম্পন্ন করতে বিশেষ ক্যাম্প শুরু করেছে বাংলাদেশ ক্রিকেট দল। মিরপুরের অ্যাকাডেমি মাঠে চলছে এ ক্যাম্প।",
        en: "The Bangladesh cricket team has begun a special camp to complete its World Cup preparations at the academy ground in Mirpur.",
      },
      {
        bn: "দলের স্ট্রেংথ অ্যান্ড কন্ডিশনিং কোচ বলেছেন, ফিটনেসই এখন সর্বোচ্চ অগ্রাধিকার। মেন্টাল কোচিং দিয়েও খেলোয়াড়দের চাপ মোকাবিলার দক্ষতা বাড়ানো হচ্ছে।",
        en: "The team's strength-and-conditioning coach says fitness is the top priority, while mental coaching builds players' ability to handle pressure.",
      },
      {
        bn: "আগামী মাসে দুটি প্রস্তুতি ম্যাচ খেলবে বাংলাদেশ। নির্বাচকরা চান, দলের মূল একাদশ স্থির করে বিশ্বকাপে যতটা সম্ভব সেরা স্কোয়াড পাঠাতে।",
        en: "Bangladesh will play two warm-up matches next month. Selectors want a settled eleven and the strongest possible squad for the World Cup.",
      },
    ],
  },
  {
    slug: "film-festival-award-national",
    category: "entertainment",
    image: "https://picsum.photos/seed/entertainment-film/1200/800",
    views: "১৬,৭৮০",
    featured: true,
    breaking: false,
    title: {
      bn: "আন্তর্জাতিক চলচ্চিত্র উৎসবে পুরস্কার পেল বাংলাদেশের ছবি 'নদীর গান'",
      en: "Bangladeshi film 'Nodir Gan' wins award at international festival",
    },
    summary: {
      bn: "সমালোচকদের প্রশংসা কুড়িয়েছে ছবিটি। পরিচালক বলেছেন, দেশের গল্প বিদেশি দর্শকের হৃদয় স্পর্শ করেছে।",
      en: "The film has won critical acclaim, with its director saying the story touched foreign audiences' hearts.",
    },
    author: { bn: "শারমিন সুলতানা", en: "Sharmin Sultana" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, রাত ১১:৫০",
      en: "Monday, 15 September 2026, 11:50 PM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "এই মাসে অনুষ্ঠিত আন্তর্জাতিক চলচ্চিত্র উৎসবে বাংলাদেশের নির্মিত 'নদীর গান' সেরা চলচ্চিত্রের পুরস্কার জিতেছে। জুরি বোর্ডের মতে, ছবিটি অপরূপ নদীজীবনের গল্প অনন্য দৃষ্টিভঙ্গিতে তুলে এনেছে।",
        en: "'Nodir Gan', produced in Bangladesh, won the best film award at this month's international festival. The jury lauded its unique take on the poetry of riverine life.",
      },
      {
        bn: "পরিচালক সংবাদমাধ্যমকে জানান, দশ বছর ধরে স্বপ্ন দেখে এই ছবিটি বানিয়েছেন। পুরস্কারটি দেশের তরুণ নির্মাতাদের অনুপ্রেরণার জন্য গুরুত্বপূর্ণ বলে মন্তব্য করেছেন তিনি।",
        en: "The director told the press he dreamt of this film for ten years, calling the award an inspiration for young filmmakers back home.",
      },
      {
        bn: "চলচ্চিত্রটি দেশের প্রেক্ষাগৃহে মুক্তি পাচ্ছে আগামী মাসে। ট্রেলার ইতোমধ্যে অনলাইনে দর্শকদের মাঝে ব্যাপক সাড়া ফেলেছে।",
        en: "The film hits local cinemas next month, and its trailer has already gone viral among viewers online.",
      },
    ],
  },
  {
    slug: "new-music-video-release",
    category: "entertainment",
    image: "https://picsum.photos/seed/entertainment-music/1200/800",
    views: "২৮,৪৪০",
    featured: false,
    breaking: false,
    title: {
      bn: "খ্যাতিমান ব্যান্ডের নতুন গান প্রকাশ, সামাজিক মাধ্যমে ভাইরাল ২৪ ঘণ্টায়",
      en: "Popular band drops new song, viral within 24 hours",
    },
    summary: {
      bn: "গানের ভিডিওতে ধরা পড়েছে গ্রামীণ বাংলাদেশের নান্দনিক দৃশ্য। ২৪ ঘণ্টায় ৫০ লাখ ভিউ পার করেছে।",
      en: "The video showcases scenic rural Bangladesh and crossed 5 million views in a day.",
    },
    author: { bn: "রুবাইয়া আনজুম", en: "Rubaiya Anzum" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, রাত ১১:৩০",
      en: "Monday, 15 September 2026, 11:30 PM",
    },
    readTime: { bn: "২ মিনিট", en: "2 min" },
    content: [
      {
        bn: "দেশের জনপ্রিয় ব্যান্ড 'দুই কূল' তাদের নতুন গান 'অধরা' প্রকাশ করেছে। গানটি মুক্তি পেতেই সামাজিক যোগাযোগ মাধ্যমে ছড়িয়ে পড়েছে ভাইরাল।",
        en: "Popular band Dui Kool released their new track 'Adhora', which went viral on social media the moment it dropped.",
      },
      {
        bn: "ভিডিওতে গ্রামীণ বাংলার নদী, ধানখেত ও পাখির দৃশ্য ফুটিয়ে তোলা হয়েছে। ব্যান্ডের গিটারিস্ট জানান, এই গানের অনুপ্রেরণা তাদের শৈশবের স্মৃতি থেকে এসেছে।",
        en: "The video features rivers, paddy fields and birds of rural Bengal. The band's guitarist says childhood memories inspired the song.",
      },
      {
        bn: "মাত্র ২৪ ঘণ্টায় ভিডিওটি ৫০ লাখেরও বেশি বার দেখা হয়েছে। সঙ্গীত সমালোচকরা বলছেন, গানের সুর ও কথার সরলতাই এর জনপ্রিয়তার মূল কারণ।",
        en: "The video passed 5 million views in just 24 hours. Critics attribute the popularity to the simplicity of the melody and lyrics.",
      },
    ],
  },
  {
    slug: "annual-halud-program-live",
    category: "entertainment",
    image: "https://picsum.photos/seed/entertainment-live/1200/800",
    views: "১০,৯২০",
    featured: false,
    breaking: false,
    title: {
      bn: "বিনোদনজগতের বড় আসরে দেশসেরা শিল্পীদের সরব উপস্থিতি, স্পর্শ করেছে দর্শকের হৃদয়",
      en: "Top artists light up a grand entertainment night, touching hearts of the audience",
    },
    summary: {
      bn: "বার্ষিক আয়োজন 'গানের রাত'-এ এবার ছিল অভিনব মঞ্চ। হাজারো দর্শক উপস্থিত ছিলেন সরাসরি।",
      en: "This year's annual 'Raat of Music' featured a novel stage with thousands attending live.",
    },
    author: { bn: "প্রশান্ত চৌধুরী", en: "Proshanta Chowdhury" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, রাত ১১:০০",
      en: "Monday, 15 September 2026, 11:00 PM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "বার্ষিক সাংস্কৃতিক আয়োজন 'গানের রাত'-এ এবার ছিল ব্যতিক্রমী উপস্থাপনা। শহরের কেন্দ্রীয় স্টেডিয়ামে আয়োজিত অনুষ্ঠানে উপচে পড়া ভিড়।",
        en: "This year's annual cultural programme 'Ganer Raat' brought a distinctive presentation to the central stadium, drawing an overflowing crowd.",
      },
      {
        bn: "দেশের শীর্ষস্থানীয় প্রায় ১৫ জন শিল্পী এক মঞ্চে পরিবেশন করেন। প্রথমবারের মতো অগমেন্টেড রিয়েলিটি প্রযুক্তিতে দর্শকদের সামনে রাখা হয় নাচের পরিবেশনা।",
        en: "Around 15 leading artists performed on a single stage, with a dance showcase presented to audiences using augmented reality for the first time.",
      },
      {
        bn: "আয়োজকরা জানান, অনুষ্ঠানটি অনলাইনেও সরাসরি সম্প্রচার করা হয়েছে। দর্শকদের ভালোবাসাই তাদের সবচেয়ে বড় প্রেরণা বলে উল্লেখ করেন তারা।",
        en: "Organisers said the show was also streamed live online, adding that the audience's love is their greatest motivation.",
      },
    ],
  },
  {
    slug: "smartphone-launch-bangladesh",
    category: "technology",
    image: "https://picsum.photos/seed/tech-mobile/1200/800",
    views: "১৪,৫৬০",
    featured: false,
    breaking: false,
    title: {
      bn: "দেশে আসছে সাশ্রয়ী স্মার্টফোন, ৫জি সাপোর্টসহ মাত্র ৯ হাজার টাকায়",
      en: "Affordable 5G smartphone hits Bangladesh at just Tk 9,000",
    },
    summary: {
      bn: "সরকারি উদ্যোগ 'ডিজিটাল বাংলাদেশ ফর অল' প্রকল্পের আওতায় প্রথম পর্যায়ে ৫০ লাখ ডিভাইস।",
      en: "Under the 'Digital Bangladesh for All' drive, 5 million devices in the first phase.",
    },
    author: { bn: "ইমরান কবির", en: "Imran Kabir" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, রাত ১০:৪০",
      en: "Monday, 15 September 2026, 10:40 PM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "সাশ্রয়ী দামে স্মার্টফোন পাওয়া এগিয়ে নিতে ‘ডিজিটাল বাংলাদেশ ফর অল’ প্রকল্প চালু করেছে সরকার। প্রথম পর্যায়ে মাত্র ৯ হাজার টাকায় ৫জি সাপোর্টেড স্মার্টফোন কেনা যাবে।",
        en: "The government has launched the 'Digital Bangladesh for All' project to make smartphones affordable, with 5G-enabled devices available for just Tk 9,000 in the first phase.",
      },
      {
        bn: "আইসিটি বিভাগ জানিয়েছে, প্রথম পর্যায়ে ৫০ লাখ ডিভাইস বিতরণ করা হবে। এউদ্যোগে শিক্ষার্থী ও কৃষকদের অগ্রাধিকার দেওয়া হবে।",
        en: "The ICT division said 5 million devices will be distributed first, prioritising students and farmers.",
      },
      {
        bn: "বিশেষজ্ঞরা বলছেন, এতে ডিজিটাল বৈষম্য কমবে এবং গ্রামীণ মানুষের ইন্টারনেট ব্যবহারে নতুন মাত্রা যোগ হবে। সাশ্রয়ী ডিভাইসে ফিঙ্গারপ্রিন্টসহ আধুনিক ফিচারও থাকছে।",
        en: "Experts say this will close the digital divide and add a new dimension to rural internet use, with fingerprint and other modern features packed into the budget devices.",
      },
    ],
  },
  {
    slug: "ai-translation-government-services",
    category: "technology",
    image: "https://picsum.photos/seed/tech-ai/1200/800",
    views: "১২,৩০০",
    featured: false,
    breaking: false,
    title: {
      bn: "প্রশাসনিক সেবায় কৃত্রিম বুদ্ধিমত্তা, বাংলায় অটোমেটিক অনুবাদে সরকারি সেবা দ্রুততর",
      en: "AI speeds up government services with automatic Bangla translation",
    },
    summary: {
      bn: "ই-নথি থেকে লাইসেন্স—সবখানে যুক্ত হচ্ছে এআই ভিত্তিক অনুবাদ ও অটোমেশন।",
      en: "AI-based translation and automation are being added everywhere, from e-files to licences.",
    },
    author: { bn: "নাজমুস সাকিব", en: "Nazmus Sakib" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, রাত ১০:২০",
      en: "Monday, 15 September 2026, 10:20 PM",
    },
    readTime: { bn: "৪ মিনিট", en: "4 min" },
    content: [
      {
        bn: "সরকারি সেবার ডিজিটাল রূপান্তরে এবার বড় ভূমিকা নিচ্ছে কৃত্রিম বুদ্ধিমত্তা। নতুন পাইলট প্রকল্পে দাপ্তরিক নথি স্বয়ংক্রিয়ভাবে ইংরেজি থেকে বাংলায় অনুবাদ হওয়ায় নাগরিক সেবার সময় কমেছে।",
        en: "Artificial intelligence is now playing a major role in the digital transformation of public services. In a new pilot, automatic English-to-Bangla translation of official documents has cut service time for citizens.",
      },
      {
        bn: "ডাক, টেলিযোগাযোগ ও তথ্যপ্রযুক্তি মন্ত্রণালয় জানিয়েছে, জাতীয় ই-নথি ব্যবস্থা, জমির রেকর্ড ও পাসপোর্ট আবেদনে এআই সহায়ক সিস্টেম যুক্ত হচ্ছে।",
        en: "The posts, telecom and ICT ministry says AI-assisted systems are being added to the national e-file system, land records and passport applications.",
      },
      {
        bn: "প্রযুক্তি বিশেষজ্ঞদের মতে, এআইয়ের যথাযথ ব্যবহারে জটিল প্রশাসনিক কাজেও মানুষের ভুল কমবে। তবে ডেটা সুরক্ষা ও মানব তদারকির গুরুত্বও অপরিসীম বলে মনে করছেন তারা।",
        en: "Technology experts believe proper AI use will reduce human error even in complex administrative work, but stress the importance of data protection and human oversight.",
      },
    ],
  },
  {
    slug: "rohingya-refugee-aid-situation",
    category: "national",
    image: "https://picsum.photos/seed/national-refugee/1200/800",
    views: "৯,১২০",
    featured: false,
    breaking: false,
    title: {
      bn: "শরণার্থী শিবিরে শিশুদের শিক্ষা সুযোগ বাড়াতে উদ্যোগ, এগিয়ে এল আন্তর্জাতিক সংস্থা",
      en: "International agency steps in to expand education for children in refugee camps",
    },
    summary: {
      bn: "প্রত্যন্ত মানবিক সংকট মোকাবিলায় ৮০টি নতুন শিক্ষা কেন্দ্র স্থাপন করা হবে এ বছর।",
      en: "To address a entrenched humanitarian crisis, 80 new learning centres will be set up this year.",
    },
    author: { bn: "কামরুল হাসান", en: "Kamrul Hasan" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, রাত ৯:৫০",
      en: "Monday, 15 September 2026, 9:50 PM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "সাম্প্রতিক সংকটে আটকে পড়া জনগোষ্ঠীর শিশুদের শিক্ষার সুযোগ বাড়াতে দেশজুড়ে নতুন ৮০টি অস্থায়ী শিক্ষা কেন্দ্র স্থাপনের উদ্যোগ নিয়েছে একটি আন্তর্জাতিক সংস্থা।",
        en: "An international agency plans to establish 80 new temporary learning centres nationwide to expand education for children caught in the recent crisis.",
      },
      {
        bn: "সংস্থাটির প্রতিনিধিরা জানান, আগামী ছয় মাসের মধ্যে কেন্দ্রগুলো চালু করা হবে। পাঠদানের পাশাপাশি শিশুদের মানসিক সমর্থনেও কাজ করবে স্বেচ্ছাসেবক দল।",
        en: "The agency's representatives said the centres will open within six months, with volunteer teams providing psychosocial support alongside teaching.",
      },
      {
        bn: "স্থানীয় প্রশাসন এই উদ্যোগকে স্বাগত জানিয়েছে। সরকারের সংশ্লিষ্ট বিভাগ জানিয়েছে, এ ধরনের উদ্যোগে সর্বাত্মক সহযোগিতা করা হবে।",
        en: "Local authorities have welcomed the initiative, and the relevant government department pledged full cooperation for such efforts.",
      },
    ],
  },
  {
    slug: "health-free-treatment-camp",
    category: "lifestyle",
    image: "https://picsum.photos/seed/lifestyle-health/1200/800",
    views: "৫,৯৮০",
    featured: false,
    breaking: false,
    title: {
      bn: "গ্রামীণ জনগোষ্ঠীর জন্য বিনামূল্যে চিকিৎসা শিবির, সেবা নিলেন সাত হাজার রোগী",
      en: "Free health camp serves 7,000 patients in rural areas",
    },
    summary: {
      bn: "দুর্গম অঞ্চলে স্বাস্থ্য সেবা পৌঁছে দিতে সপ্তাহব্যাপী গণচিকিৎসা শিবিরের আয়োজন।",
      en: "A week-long medical camp brings healthcare to remote regions.",
    },
    author: { bn: "ডা. শামসুন নাহার", en: "Dr. Shamsun Nahar" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, রাত ৯:৩০",
      en: "Monday, 15 September 2026, 9:30 PM",
    },
    readTime: { bn: "২ মিনিট", en: "2 min" },
    content: [
      {
        bn: "দেশের প্রত্যন্ত অঞ্চলের জনগোষ্ঠীর জন্য সপ্তাহব্যাপী বিনামূল্যে চিকিৎসা শিবিরের আয়োজন করা হয়েছে। প্রথম চার দিনে সেবা নিয়েছেন প্রায় সাত হাজার রোগী।",
        en: "A week-long free medical camp has been organised for people in remote areas, serving around 7,000 patients in its first four days.",
      },
      {
        bn: "শিবিরে চিকিৎসকদের পাশাপাশি ছিলেন ডায়াবেটিস ও উচ্চ রক্তচাপসংক্রান্ত পরীক্ষার বিশেষজ্ঞ। বিনামূল্যে ওষুধও বিতরণ করা হচ্ছে।",
        en: "Alongside doctors, specialists screened for diabetes and hypertension, and medicines were distributed free of charge.",
      },
      {
        bn: "আয়োজকরা জানান, গ্রামের মানুষ চিকিৎসার সুযোগ থেকে বঞ্চিত না হন সেটাই মূল লক্ষ্য। আগামী মাসেও নতুন এলাকায় এমন শিবির আয়োজনের পরিকল্পনা রয়েছে।",
        en: "Organisers say the goal is that rural people no longer miss out on medical care, with plans for similar camps in new areas next month.",
      },
    ],
  },
  {
    slug: "river-cruise-tourism-expand",
    category: "lifestyle",
    image: "https://picsum.photos/seed/lifestyle-river/1200/800",
    views: "৮,৪১০",
    featured: false,
    breaking: false,
    title: {
      bn: "গাঙচিলের ডাক নেই, রাতের নদী ভ্রমণে ভিনদেশি পর্যটকের ঢল",
      en: "Night river cruises draw a flood of tourists from home and abroad",
    },
    summary: {
      bn: "মহানগরের ব্যস্ততা থেকে ছুটি কাটাতে নদীবক্ষে ভ্রমণের জনপ্রিয়তা বেড়েছে বহুগুণ।",
      en: "River journeys have surged in popularity as an escape from city bustle.",
    },
    author: { bn: "মোহাম্মদ আলী", en: "Mohammad Ali" },
    publishedAt: {
      bn: "১৫ সেপ্টেম্বর ২০২৬, রাত ৯:০০",
      en: "Monday, 15 September 2026, 9:00 PM",
    },
    readTime: { bn: "৩ মিনিট", en: "3 min" },
    content: [
      {
        bn: "রাতের নদী ভ্রমণ এখন দেশি-বিদেশি পর্যটকদের অন্যতম প্রিয় বিনোদন। ঢাকা থেকে নারায়ণগঞ্জ পর্যন্ত চলমান ভ্রমণে প্রতিদিন গড়ে তিন হাজার যাত্রী অংশ নিচ্ছেন।",
        en: "Night river cruises have become a favourite pastime for local and foreign tourists, with an average of 3,000 passengers daily on the Dhaka–Narayanganj route.",
      },
      {
        bn: "ট্যুর অপারেটররা জানান, নদীর দুই পাড়ের আলোকসজ্জা ও খোলা আকাশের নিচে আড্ডাই এই ভ্রমণের মূল আকর্ষণ। নিরাপত্তা নিশ্চিত করতেও নেওয়া হচ্ছে নতুন উদ্যোগ।",
        en: "Operators say the riverside lights and open-air hangouts are the main draw, and new measures are being taken to ensure safety.",
      },
      {
        bn: "পর্যটন বিশেষজ্ঞদের মতে, নদীভিত্তিক পর্যটন দেশের অর্থনীতিতে নতুন মাত্রা যোগ করবে। সরকার এই খাতকে উৎসাহিত করতে নৌরুট সম্প্রসারণের পরিকল্পনা করছে।",
        en: "Tourism experts say river-based tourism will add a new dimension to the economy, and the government plans to expand waterways to encourage the sector.",
      },
    ],
  },
];

export function getCategory(slug: string): CategorySource | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: CategorySlug, locale: Locale): string {
  return categories.find((c) => c.slug === slug)?.name[locale] ?? slug;
}

function localize(article: ArticleSource, locale: Locale): Article {
  return {
    slug: article.slug,
    category: article.category,
    categoryName: getCategoryName(article.category, locale),
    image: article.image,
    views: article.views,
    featured: article.featured,
    breaking: article.breaking,
    title: article.title[locale],
    summary: article.summary[locale],
    author: article.author[locale],
    publishedAt: article.publishedAt[locale],
    readTime: article.readTime[locale],
    content: article.content.map((paragraph) => paragraph[locale]),
  };
}

export function getArticles(locale: Locale): Article[] {
  return articleSources.map((article) => localize(article, locale));
}

export function getArticleBySlug(
  slug: string,
  locale: Locale,
): Article | undefined {
  const source = articleSources.find((article) => article.slug === slug);
  return source ? localize(source, locale) : undefined;
}

export function getArticlesByCategory(
  slug: CategorySlug,
  locale: Locale,
): Article[] {
  return getArticles(locale).filter((article) => article.category === slug);
}

export function getFeaturedArticles(locale: Locale): Article[] {
  return getArticles(locale).filter((article) => article.featured);
}

export function getBreakingArticles(locale: Locale): Article[] {
  return getArticles(locale).filter((article) => article.breaking);
}