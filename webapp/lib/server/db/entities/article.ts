import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ArticleTag } from "./article-tag";
import { ArticleContent } from "./article-content";
import { Category } from "./category";
import { ARTICLE_STATUSES, type ArticleStatus } from "./enums";
import { Media } from "./media";
import { User } from "./user";

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 200 })
  slug!: string;

  @Column({ name: "category_id", type: "smallint" })
  categoryId!: number;

  @Column({ name: "author_id", type: "bigint", nullable: true })
  authorId?: string | null;

  @Column({ name: "created_by", type: "bigint", nullable: true })
  createdById?: string | null;

  @Column({ name: "updated_by", type: "bigint", nullable: true })
  updatedById?: string | null;

  @Column({ name: "published_by", type: "bigint", nullable: true })
  publishedById?: string | null;

  @Column({
    type: "enum",
    enum: [...ARTICLE_STATUSES],
    enumName: "article_status",
    default: "draft",
  })
  status!: ArticleStatus;

  @Column({ name: "is_featured", type: "boolean", default: false })
  isFeatured!: boolean;

  @Column({ name: "is_breaking", type: "boolean", default: false })
  isBreaking!: boolean;

  @Column({ name: "published_at", type: "timestamptz", nullable: true })
  publishedAt?: string | Date | null;

  @Column({ name: "featured_media_id", type: "bigint", nullable: true })
  featuredMediaId?: string | null;

  @ManyToOne(() => Category, (category) => category.articles)
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "author_id" })
  author?: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "created_by" })
  createdBy?: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "updated_by" })
  updatedBy?: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "published_by" })
  publishedBy?: User | null;

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn({ name: "featured_media_id" })
  featuredMedia?: Media | null;

  @OneToMany(() => ArticleContent, (content) => content.article, {
    cascade: true,
  })
  contents?: ArticleContent[];

  @OneToMany(() => ArticleTag, (articleTag) => articleTag.article, {
    cascade: true,
  })
  articleTags?: ArticleTag[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt?: Date | null;
}