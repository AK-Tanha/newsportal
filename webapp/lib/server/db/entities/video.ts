import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./category";
import { VIDEO_STATUSES, type VideoStatus } from "./enums";
import { Media } from "./media";
import { User } from "./user";

@Entity("videos")
export class Video {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 200 })
  slug!: string;

  @Column({ name: "category_id", type: "smallint" })
  categoryId!: number;

  @Column({ name: "author_id", type: "bigint", nullable: true })
  authorId?: string | null;

  @Column({ name: "poster_media_id", type: "bigint", nullable: true })
  posterMediaId?: string | null;

  @Column({ name: "title_bn", type: "varchar", length: 300 })
  titleBn!: string;

  @Column({ name: "title_en", type: "varchar", length: 300 })
  titleEn!: string;

  @Column({ name: "summary_bn", type: "text" })
  summaryBn!: string;

  @Column({ name: "summary_en", type: "text" })
  summaryEn!: string;

  @Column({ name: "video_url", type: "text" })
  videoUrl!: string;

  @Column({ name: "duration_seconds", type: "int", default: 0 })
  durationSeconds!: number;

  @Column({ name: "views_count", type: "int", default: 0 })
  viewsCount!: number;

  @Column({ type: "boolean", default: false })
  featured!: boolean;

  @Column({
    type: "enum",
    enum: [...VIDEO_STATUSES],
    enumName: "video_status",
    default: "draft",
  })
  status!: VideoStatus;

  @Column({ name: "published_at", type: "timestamptz", nullable: true })
  publishedAt?: string | Date | null;

  @ManyToOne(() => Category, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "author_id" })
  author?: User | null;

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn({ name: "poster_media_id" })
  poster?: Media | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt?: Date | null;
}