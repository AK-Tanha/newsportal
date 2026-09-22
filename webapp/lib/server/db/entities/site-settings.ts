import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user";

@Entity("site_settings")
export class SiteSettings {
  @PrimaryColumn({ type: "smallint", default: 1 })
  id!: number;

  @Column({ name: "site_name_bn", type: "varchar", length: 200 })
  siteNameBn!: string;

  @Column({ name: "site_name_en", type: "varchar", length: 200 })
  siteNameEn!: string;

  @Column({ name: "tagline_bn", type: "varchar", length: 300 })
  taglineBn!: string;

  @Column({ name: "tagline_en", type: "varchar", length: 300 })
  taglineEn!: string;

  @Column({ name: "logo_url", type: "text" })
  logoUrl!: string;

  @Column({ name: "favicon_url", type: "text" })
  faviconUrl!: string;

  @Column({ name: "newsletter_email", type: "varchar", length: 255, nullable: true })
  newsletterEmail?: string | null;

  @Column({ name: "editor_name_bn", type: "varchar", length: 200 })
  editorNameBn!: string;

  @Column({ name: "editor_name_en", type: "varchar", length: 200 })
  editorNameEn!: string;

  @Column({ name: "facebook_url", type: "text", nullable: true })
  facebookUrl?: string | null;

  @Column({ name: "twitter_url", type: "text", nullable: true })
  twitterUrl?: string | null;

  @Column({ name: "instagram_url", type: "text", nullable: true })
  instagramUrl?: string | null;

  @Column({ name: "youtube_url", type: "text", nullable: true })
  youtubeUrl?: string | null;

  @Column({ name: "latest_articles_count", type: "int", default: 8 })
  latestArticlesCount!: number;

  @Column({ name: "most_read_count", type: "int", default: 5 })
  mostReadCount!: number;

  @Column({ name: "breaking_max_items", type: "int", default: 10 })
  breakingMaxItems!: number;

  @Column({ name: "default_live_slug", type: "varchar", length: 200, nullable: true })
  defaultLiveSlug?: string | null;

  @Column({ name: "meta_title_bn", type: "varchar", length: 300 })
  metaTitleBn!: string;

  @Column({ name: "meta_title_en", type: "varchar", length: 300 })
  metaTitleEn!: string;

  @Column({ name: "meta_description_bn", type: "text" })
  metaDescriptionBn!: string;

  @Column({ name: "meta_description_en", type: "text" })
  metaDescriptionEn!: string;

  @Column({ name: "og_image_url", type: "text", nullable: true })
  ogImageUrl?: string | null;

  @Column({ name: "metadata_base_url", type: "text", nullable: true })
  metadataBaseUrl?: string | null;

  @Column({ name: "updated_by", type: "bigint", nullable: true })
  updatedById?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "updated_by" })
  updatedBy?: User | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}