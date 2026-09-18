import { videoSources, type VideoSource } from "@/lib/videos";
import type { CategorySlug } from "@/lib/news";

export type CmsVideoStatus = "draft" | "published";

export interface CmsVideo {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: CategorySlug;
  videoUrl: string;
  image: string;
  duration: string;
  views: string;
  featured: boolean;
  publishedAt: string;
  status: CmsVideoStatus;
}

export interface CmsVideoInput {
  slug: string;
  title: string;
  summary: string;
  category: CategorySlug;
  videoUrl: string;
  image: string;
  duration: string;
  views: string;
  featured: boolean;
  publishedAt: string;
  status: CmsVideoStatus;
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

function seedDate(index: number): string {
  const date = new Date(Date.UTC(2026, 8, 18 - index));
  return date.toISOString().slice(0, 10);
}

function toCmsVideo(index: number, source: VideoSource): CmsVideo {
  return {
    id: source.slug,
    slug: source.slug,
    title: source.title.en,
    summary: source.summary.en,
    category: source.category,
    videoUrl: source.videoUrl,
    image: source.image,
    duration: source.duration.en,
    views: toLatinDigits(source.views),
    featured: source.featured,
    publishedAt: seedDate(index),
    status: "published",
  };
}

export function getCmsVideoSeeds(): CmsVideo[] {
  const published = videoSources.map((source, index) =>
    toCmsVideo(index, source),
  );
  const drafts: CmsVideo[] = [
    {
      id: "documentary-clean-water-urban-slums-2026",
      slug: "documentary-clean-water-urban-slums-2026",
      title: "Documentary: clean water returns to the urban slums",
      summary:
        "A full-length report on the community-led water projects now reaching city slums, with on-ground interviews.",
      category: "national",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      image: "https://picsum.photos/seed/draft-documentary/1200/675",
      duration: "12:05",
      views: "0",
      featured: false,
      publishedAt: "2026-09-19",
      status: "draft",
    },
    {
      id: "behind-the-scenes-eid-production-2026",
      slug: "behind-the-scenes-eid-production-2026",
      title: "Behind the scenes: Eid special production",
      summary:
        "A look at how the studio builds its Eid telecast — set design, rehearsals and the team behind the lights.",
      category: "entertainment",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      image: "https://picsum.photos/seed/draft-behindscenes/1200/675",
      duration: "6:40",
      views: "850",
      featured: false,
      publishedAt: "2026-09-20",
      status: "draft",
    },
  ];
  return [...published, ...drafts];
}