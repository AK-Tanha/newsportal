import type { EntityManager } from "typeorm";
import { Session } from "../db/entities/session";
import { User } from "../db/entities/user";
import type { UserRole } from "./auth-types";

export interface PasswordUserRow {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
}

export interface SessionRow {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export async function findPasswordUserByEmail(
  em: EntityManager,
  email: string,
): Promise<PasswordUserRow | undefined> {
  return (
    (await em
      .getRepository(User)
      .createQueryBuilder("u")
      .addSelect("u.id", "id")
      .addSelect("u.email", "email")
      .addSelect("u.password_hash", "passwordHash")
      .addSelect("u.full_name", "fullName")
      .addSelect("u.role", "role")
      .where("lower(u.email) = lower(:email)", { email })
      .getRawOne<PasswordUserRow>()) ?? undefined
  );
}

export async function findUserById(
  em: EntityManager,
  id: string,
): Promise<PasswordUserRow | undefined> {
  return (
    (await em
      .getRepository(User)
      .createQueryBuilder("u")
      .addSelect("u.id", "id")
      .addSelect("u.email", "email")
      .addSelect("u.password_hash", "passwordHash")
      .addSelect("u.full_name", "fullName")
      .addSelect("u.role", "role")
      .where("u.id = :id", { id })
      .getRawOne<PasswordUserRow>()) ?? undefined
  );
}

export async function insertSession(
  em: EntityManager,
  input: { tokenHash: string; userId: string; expiresAt: Date },
): Promise<void> {
  await em.getRepository(Session).save(
    em.create(Session, {
      tokenHash: input.tokenHash,
      userId: input.userId,
      expiresAt: input.expiresAt,
    }),
  );
}

export async function findSessionByTokenHash(
  em: EntityManager,
  tokenHash: string,
): Promise<SessionRow | undefined> {
  const session = await em.getRepository(Session).findOne({ where: { tokenHash } });
  if (!session) return undefined;
  return {
    id: String(session.id),
    userId: String(session.userId),
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt ?? null,
  };
}

export async function touchSession(em: EntityManager, tokenHash: string): Promise<void> {
  await em.getRepository(Session).update({ tokenHash }, { lastUsedAt: new Date() });
}

export async function revokeSession(em: EntityManager, tokenHash: string): Promise<void> {
  await em.getRepository(Session).update({ tokenHash }, { revokedAt: new Date() });
}

export async function deleteSession(em: EntityManager, tokenHash: string): Promise<void> {
  await em.getRepository(Session).delete({ tokenHash });
}