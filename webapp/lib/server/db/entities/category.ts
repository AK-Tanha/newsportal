import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Article } from "./article";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("identity", { type: "smallint" })
  id!: number;

  @Column({ type: "varchar", length: 50 })
  slug!: string;

  @Column({ name: "name_bn", type: "varchar", length: 100 })
  nameBn!: string;

  @Column({ name: "name_en", type: "varchar", length: 100 })
  nameEn!: string;

  @Column({ name: "description_bn", type: "text", nullable: true })
  descriptionBn?: string | null;

  @Column({ name: "description_en", type: "text", nullable: true })
  descriptionEn?: string | null;

  @Column({ type: "varchar", length: 20, default: "#e2231a" })
  color!: string;

  @Column({ name: "parent_id", type: "smallint", nullable: true })
  parentId?: number | null;

  @ManyToOne(() => Category, { onDelete: "SET NULL" })
  @JoinColumn({ name: "parent_id" })
  parent?: Category | null;

  @OneToMany(() => Article, (article) => article.category)
  articles?: Article[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}