import { adSources } from "@/lib/ads";
import { liveStreamSources } from "@/lib/live";
import { articleSources } from "@/lib/news";
import { videoSources } from "@/lib/videos";

export type MediaType = "image" | "video";

export interface CmsMedia {
  id: string;
  filename: string;
  url: string;
  type: MediaType;
  size: string;
  width: number;
  height: number;
  alt: string;
  createdAt: string;
  localFile?: boolean;
}

export interface CmsMediaInput {
  url: string;
  filename?: string;
  alt?: string;
  width?: number;
  height?: number;
  type?: MediaType;
  size?: string;
  localFile?: boolean;
}

const PICSUM_IMAGE_WIDTH = 1200;
const PICSUM_IMAGE_HEIGHT = 800;
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function estimateImageSize(width: number, height: number): string {
  return formatBytes(Math.round(width * height * 0.75));
}

export function filenameFromUrl(url: string): string {
  const seed = url.match(/\/seed\/([a-z0-9-]+)\//i)?.[1];
  if (seed) return `${seed}.jpg`;
  const last = url.split("?")[0].split("/").filter(Boolean).pop();
  return last && last !== "seed" ? last : "media-file";
}

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

export function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function seedDate(index: number): string {
  const d = new Date("2026-09-01T09:00:00Z");
  d.setDate(d.getDate() + index);
  return d.toISOString();
}

export function createCmsMedia(input: CmsMediaInput): CmsMedia {
  const width = input.width && input.width > 0 ? input.width : PICSUM_IMAGE_WIDTH;
  const height =
    input.height && input.height > 0 ? input.height : PICSUM_IMAGE_HEIGHT;
  return {
    id: `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    filename: input.filename?.trim() || filenameFromUrl(input.url),
    url: input.url.trim(),
    type: input.type ?? "image",
    size: input.size ?? estimateImageSize(width, height),
    width,
    height,
    alt: input.alt?.trim() || "",
    createdAt: new Date().toISOString(),
    localFile: input.localFile ?? false,
  };
}

export function getCmsMediaSeeds(): CmsMedia[] {
  const articleImages = articleSources.slice(0, 8).map((article, i) => ({
    id: `media-article-${article.slug}`,
    filename: `${article.slug}-${PICSUM_IMAGE_WIDTH}x${PICSUM_IMAGE_HEIGHT}.jpg`,
    url: article.image,
    type: "image" as MediaType,
    size: estimateImageSize(PICSUM_IMAGE_WIDTH, PICSUM_IMAGE_HEIGHT),
    width: PICSUM_IMAGE_WIDTH,
    height: PICSUM_IMAGE_HEIGHT,
    alt: article.title.en,
    createdAt: seedDate(i),
  }));

  const videoPosters = videoSources.slice(0, 4).map((video, i) => ({
    id: `media-poster-${video.slug}`,
    filename: `${video.slug}-1200x675.jpg`,
    url: video.image,
    type: "image" as MediaType,
    size: estimateImageSize(1200, 675),
    width: 1200,
    height: 675,
    alt: video.title.en,
    createdAt: seedDate(i),
  }));

  const livePosters = liveStreamSources.map((stream, i) => ({
    id: `media-live-${stream.slug}`,
    filename: `${stream.slug}-1200x675.jpg`,
    url: stream.poster,
    type: "image" as MediaType,
    size: estimateImageSize(1200, 675),
    width: 1200,
    height: 675,
    alt: stream.title.en,
    createdAt: seedDate(i),
  }));

  const adImages = adSources
    .filter((ad) => ad.image)
    .slice(0, 4)
    .map((ad, i) => ({
      id: `media-ad-${ad.slug}`,
      filename: `${ad.slug}-1200x400.jpg`,
      url: ad.image as string,
      type: "image" as MediaType,
      size: estimateImageSize(1200, 400),
      width: 1200,
      height: 400,
      alt: ad.title.en,
      createdAt: seedDate(i),
    }));

  const sampleVideos = videoSources.slice(0, 5).map((video, i) => ({
    id: `media-video-${video.slug}`,
    filename: `${video.slug}.mp4`,
    url: video.videoUrl,
    type: "video" as MediaType,
    size: formatBytes(VIDEO_WIDTH * VIDEO_HEIGHT * 12),
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    alt: video.title.en,
    createdAt: seedDate(i),
  }));

  return [
    ...articleImages,
    ...videoPosters,
    ...livePosters,
    ...adImages,
    ...sampleVideos,
  ];
}