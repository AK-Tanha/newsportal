import {
  categories,
  getArticles,
  getCategory,
  type Article,
  type CategorySlug,
} from "@/lib/news";

export type CmsArticleStatus = "draft" | "published";

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: CategorySlug;
  author: string;
  tags: string[];
  image: string;
  status: CmsArticleStatus;
  publishedAt: string;
  featured: boolean;
  breaking: boolean;
}

export interface CmsArticleInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: CategorySlug;
  author: string;
  tags: string[];
  image: string;
  status: CmsArticleStatus;
  publishedAt: string;
  featured: boolean;
  breaking: boolean;
}

export interface CategoryOption {
  slug: CategorySlug;
  name: string;
  color: string;
}

export const categoryOptions: CategoryOption[] = categories.map((category) => ({
  slug: category.slug,
  name: category.name.en,
  color: category.color,
}));

export function categoryName(slug: CategorySlug): string {
  return getCategory(slug)?.name.en ?? slug;
}

export function categoryColor(slug: CategorySlug): string {
  return getCategory(slug)?.color ?? "#e2231a";
}

export function statusColor(status: CmsArticleStatus): string {
  return status === "published" ? "#059669" : "#f59e0b";
}

export function statusLabel(status: CmsArticleStatus): string {
  return status === "published" ? "Published" : "Draft";
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPublishedDate(value: string): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function paragraphsToText(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}

export function textToParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const draftTagMap: Record<CategorySlug, string[]> = {
  national: ["Government", "Policy"],
  politics: ["Politics", "Parliament"],
  economy: ["Economy", "Budget"],
  international: ["World", "Diplomacy"],
  sports: ["Sports", "Cricket"],
  entertainment: ["Entertainment", "Arts"],
  technology: ["Technology", "Innovation"],
  lifestyle: ["Lifestyle", "Culture"],
};

function seedDate(index: number): string {
  const date = new Date(Date.UTC(2026, 8, 18 - index));
  return date.toISOString().slice(0, 10);
}

function toCmsArticle(index: number, article: Article): CmsArticle {
  return {
    id: article.slug,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content: paragraphsToText(article.content),
    category: article.category,
    author: article.author,
    tags: draftTagMap[article.category],
    image: article.image,
    status: "published",
    publishedAt: seedDate(index),
    featured: article.featured,
    breaking: article.breaking,
  };
}

export function getCmsArticleSeeds(): CmsArticle[] {
  const published = getArticles("en").map((article, index) =>
    toCmsArticle(index, article),
  );
  const drafts: CmsArticle[] = [
    {
      id: "exclusive-interview-economist-2026",
      slug: "exclusive-interview-economist-2026",
      title: "Exclusive: Conversation with the visiting economist on diaspora investment",
      summary:
        "A wide-ranging interview covering remittance flows, the investment climate and the road ahead for the local export sector.",
      content:
        "In an exclusive interview, the visiting economist said the country's growth story remains intact despite global headwinds.\n\nHe highlighted remittance growth and a young workforce as key structural strengths.\n\nDiaspora investment, he argued, can meaningfully close the infrastructure financing gap over the next five years.",
      category: "economy",
      author: "Rayhan Hossain",
      tags: ["Interview", "Investment"],
      image: "https://picsum.photos/seed/draft-interview/1200/800",
      status: "draft",
      publishedAt: "2026-09-19",
      featured: false,
      breaking: false,
    },
    {
      id: "metro-travel-guide-weekend",
      slug: "metro-travel-guide-weekend",
      title: "Weekend city guide: riverside spots for an autumn evening",
      summary:
        "A practical round-up of the best riverside hangouts to try this weekend, with travel notes and safety tips.",
      content:
        "As the heat finally eases, riverside spots across the city are drawing families and friends.\n\nThis guide lists the top five locations with access details, timings and crowd expectations.\n\nWe also note safety measures to keep in mind when visiting after dark.",
      category: "lifestyle",
      author: "Nusrat Jahan",
      tags: ["Travel", "Lifestyle"],
      image: "https://picsum.photos/seed/draft-travel/1200/800",
      status: "draft",
      publishedAt: "2026-09-20",
      featured: false,
      breaking: false,
    },
  ];
  return [...published, ...drafts];
}