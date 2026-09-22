import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Article } from "./article";
import type { Locale } from "./enums";

@Entity("article_contents")
export class ArticleContent {
  @PrimaryColumn({ name: "article_id", type: "bigint" })
  articleId!: string;

  @PrimaryColumn({ name: "locale", type: "char", length: 2 })
  locale!: Locale;

  @Column({ type: "varchar", length: 500 })
  title!: string;

  @Column({ type: "text" })
  summary!: string;

  @Column({ type: "text" })
  body!: string;

  @Column({ name: "read_time_minutes", type: "smallint", nullable: true })
  readTimeMinutes?: number | null;

  @Column({
    name: "search_tsv",
    type: "tsvector",
    select: false,
    generatedType: "STORED",
    asExpression: "setweight(to_tsvector('simple', coalesce(title, '')), 'A') || setweight(to_tsvector('simple', coalesce(summary, '')), 'B') || setweight(to_tsvector('simple', coalesce(body, '')), 'A')",
  })
  searchTsv?: string;

  @ManyToOne(() => Article, (article) => article.contents, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "article_id" })
  article?: Article;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}