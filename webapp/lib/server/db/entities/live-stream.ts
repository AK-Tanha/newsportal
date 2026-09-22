import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./category";
import { LIVE_STATUSES, type LiveStatus } from "./enums";
import { Media } from "./media";

@Entity("live_streams")
export class LiveStream {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 200 })
  slug!: string;

  @Column({ name: "category_id", type: "smallint" })
  categoryId!: number;

  @Column({ name: "poster_media_id", type: "bigint", nullable: true })
  posterMediaId?: string | null;

  @Column({ name: "title_bn", type: "varchar", length: 300 })
  titleBn!: string;

  @Column({ name: "title_en", type: "varchar", length: 300 })
  titleEn!: string;

  @Column({ name: "description_bn", type: "text" })
  descriptionBn!: string;

  @Column({ name: "description_en", type: "text" })
  descriptionEn!: string;

  @Column({ name: "stream_url", type: "text", nullable: true })
  streamUrl?: string | null;

  @Column({ name: "is_active", type: "boolean", default: false })
  isActive!: boolean;

  @Column({
    type: "enum",
    enum: [...LIVE_STATUSES],
    enumName: "live_status",
    default: "offline",
  })
  status!: LiveStatus;

  @Column({ name: "started_at", type: "timestamptz", nullable: true })
  startedAt?: string | Date | null;

  @Column({ name: "viewer_count", type: "int", default: 0 })
  viewerCount!: number;

  @ManyToOne(() => Category, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn({ name: "poster_media_id" })
  poster?: Media | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}