import { Advertisement } from "./advertisement";
import { AdvertisementPlacement } from "./advertisement-placement";
import { Article } from "./article";
import { ArticleContent } from "./article-content";
import { ArticleTag } from "./article-tag";
import { Category } from "./category";
import { LiveStream } from "./live-stream";
import { Media } from "./media";
import { Session } from "./session";
import { SiteSettings } from "./site-settings";
import { Tag } from "./tag";
import { User } from "./user";
import { Video } from "./video";

type EntityClass = new (...args: never[]) => unknown;

export const entities: EntityClass[] = [
  User,
  Session,
  Category,
  Tag,
  Media,
  Article,
  ArticleContent,
  ArticleTag,
  Video,
  LiveStream,
  Advertisement,
  AdvertisementPlacement,
  SiteSettings,
];

export {
  User,
  Session,
  Category,
  Tag,
  Media,
  Article,
  ArticleContent,
  ArticleTag,
  Video,
  LiveStream,
  Advertisement,
  AdvertisementPlacement,
  SiteSettings,
};

export * from "./enums";