import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import { AdvertisementPlacement } from "./advertisement-placement";
import { AD_TYPES, type AdType } from "./enums";
import { Media } from "./media";

@Entity("advertisements")
export class Advertisement {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 200 })
  slug!: string;

  @Column({
    type: "enum",
    enum: [...AD_TYPES],
    enumName: "ad_type",
    default: "banner",
  })
  type!: AdType;

  @Column({ name: "title_bn", type: "varchar", length: 300 })
  titleBn!: string;

  @Column({ name: "title_en", type: "varchar", length: 300 })
  titleEn!: string;

  @Column({ name: "description_bn", type: "text", nullable: true })
  descriptionBn?: string | null;

  @Column({ name: "description_en", type: "text", nullable: true })
  descriptionEn?: string | null;

  @Column({ name: "image_media_id", type: "bigint", nullable: true })
  imageMediaId?: string | null;

  @Column({ name: "target_url", type: "text" })
  targetUrl!: string;

  @Column({ type: "varchar", length: 300, nullable: true })
  alt?: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "start_date", type: "date", nullable: true })
  startDate?: string | null;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate?: string | null;

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn({ name: "image_media_id" })
  image?: Media | null;

  @OneToMany(
    () => AdvertisementPlacement,
    (placement) => placement.advertisement,
    { cascade: true },
  )
  placements?: Relation<AdvertisementPlacement[]>;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}