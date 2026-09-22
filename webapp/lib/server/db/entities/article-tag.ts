import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Article } from "./article";
import { Tag } from "./tag";

@Entity("article_tags")
export class ArticleTag {
  @PrimaryColumn({ name: "article_id", type: "bigint" })
  articleId!: string;

  @PrimaryColumn({ name: "tag_id", type: "bigint" })
  tagId!: string;

  @Column({ name: "created_at", type: "timestamptz", default: () => "now()" })
  createdAt!: Date;

  @ManyToOne(() => Article, (article) => article.articleTags, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "article_id" })
  article?: Article;

  @ManyToOne(() => Tag, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tag_id" })
  tag?: Tag;
}