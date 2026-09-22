import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user";

/**
 * A server-side admin session.
 *
 * Only the SHA-256 hex hash of the session identifier is stored here — the
 * raw identifier is never persisted and exists only in the HttpOnly
 * authentication cookie. Deleting a user cascades here, revoking every
 * session they hold.
 */
@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  userId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @Column({ name: "token_hash", type: "char", length: 64 })
  tokenHash!: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "last_used_at", type: "timestamptz", nullable: true })
  lastUsedAt?: Date | null;

  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  revokedAt?: Date | null;
}