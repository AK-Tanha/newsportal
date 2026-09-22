import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MEDIA_TYPES, type MediaType } from "./enums";
import { User } from "./user";

@Entity("media")
export class Media {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 255 })
  filename!: string;

  @Column({ type: "text" })
  url!: string;

  @Column({ name: "storage_key", type: "varchar", length: 255, nullable: true })
  storageKey?: string | null;

  @Column({ type: "enum", enum: [...MEDIA_TYPES], enumName: "media_type", default: "image" })
  type!: MediaType;

  @Column({ name: "mime_type", type: "varchar", length: 127, nullable: true })
  mimeType?: string | null;

  @Column({ name: "size_bytes", type: "bigint", nullable: true })
  sizeBytes?: string | null;

  @Column({ type: "int", nullable: true })
  width?: number | null;

  @Column({ type: "int", nullable: true })
  height?: number | null;

  @Column({ type: "varchar", length: 300, nullable: true })
  alt?: string | null;

  @Column({ name: "uploader_id", type: "bigint", nullable: true })
  uploaderId?: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "uploader_id" })
  uploader?: User | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}