import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { USER_ROLES, type UserRole } from "./enums";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ name: "full_name", type: "varchar", length: 200 })
  fullName!: string;

  @Column({ type: "enum", enum: [...USER_ROLES], enumName: "user_role", default: "editor" })
  role!: UserRole;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}