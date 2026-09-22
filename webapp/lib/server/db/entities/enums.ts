export type Locale = "bn" | "en";

export type UserRole = "admin" | "editor";

export type ArticleStatus = "draft" | "published";

export type VideoStatus = "draft" | "published";

export type LiveStatus = "live" | "offline";

export type MediaType = "image" | "video";

export type AdType = "banner" | "text" | "sponsored";

export type AdPlacement =
  | "header"
  | "below-hero"
  | "sidebar"
  | "in-feed"
  | "in-content"
  | "popup";

export const USER_ROLES = ["admin", "editor"] as const;

export const ARTICLE_STATUSES = ["draft", "published"] as const;

export const VIDEO_STATUSES = ["draft", "published"] as const;

export const LIVE_STATUSES = ["live", "offline"] as const;

export const MEDIA_TYPES = ["image", "video"] as const;

export const AD_TYPES = ["banner", "text", "sponsored"] as const;

export const AD_PLACEMENTS = [
  "header",
  "below-hero",
  "sidebar",
  "in-feed",
  "in-content",
  "popup",
] as const;