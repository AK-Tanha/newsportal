import { getInitializedDataSource } from "../db/data-source";
import { Errors } from "./auth-errors";
import {
  generateSessionToken,
  hashSessionToken,
  isValidSessionToken,
  verifyPassword,
} from "./auth-crypto";
import {
  deleteSession,
  findPasswordUserByEmail,
  findSessionByTokenHash,
  findUserById,
  insertSession,
  revokeSession,
  touchSession,
  type PasswordUserRow,
} from "./auth-repository";
import { sessionTtlSeconds } from "./auth-session";
import type { AuthContext, SessionUser } from "./auth-types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginInput(
  email: string | undefined,
  password: string | undefined,
): void {
  const details: Array<{ field: string; issues: string[] }> = [];
  if (email === undefined || email.trim() === "") {
    details.push({ field: "email", issues: ["Email is required."] });
  } else if (email.length > 255 || !EMAIL_PATTERN.test(email.trim())) {
    details.push({ field: "email", issues: ["Must be a valid email address."] });
  }
  if (password === undefined || password === "") {
    details.push({ field: "password", issues: ["Password is required."] });
  }
  if (details.length > 0) throw Errors.invalidLogin(details);
}

function toSessionUser(row: Omit<PasswordUserRow, "passwordHash">): SessionUser {
  return { id: row.id, email: row.email, fullName: row.fullName, role: row.role };
}

export const authService = {
  /**
   * Authenticates an email/password pair, creates a server-side session and
   * returns the raw session token (to be placed in the HttpOnly cookie) plus
   * the safe user projection. Failures are intentionally indistinguishable
   * between "no such email" and "wrong password".
   */
  async login(input: { email?: string; password?: string }): Promise<{
    user: SessionUser;
    token: string;
  }> {
    validateLoginInput(input.email, input.password);
    const email = input.email!.trim().toLowerCase();
    const password = input.password!;

    const ds = await getInitializedDataSource();
    const user = await findPasswordUserByEmail(ds.manager, email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw Errors.invalidCredentials();
    }

    const token = generateSessionToken();
    await insertSession(ds.manager, {
      tokenHash: hashSessionToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + sessionTtlSeconds() * 1000),
    });

    return { user: toSessionUser(user), token };
  },

  /**
   * Invalidates the session belonging to the given token. Safe to call with
   * no/unknown token (the endpoint always succeeds and clears the cookie).
   */
  async logout(token: string | undefined): Promise<void> {
    if (!token || !isValidSessionToken(token)) return;
    const ds = await getInitializedDataSource();
    await revokeSession(ds.manager, hashSessionToken(token));
  },

  /**
   * Resolves the raw session cookie token into an authenticated context.
   * Throws AUTH_REQUIRED / SESSION_EXPIRED on any invalid state. Malformed
   * cookie values are rejected without any database work.
   */
  async authenticate(token: string | undefined): Promise<AuthContext> {
    if (!token || !isValidSessionToken(token)) throw Errors.authRequired();

    const tokenHash = hashSessionToken(token);
    const ds = await getInitializedDataSource();
    const session = await findSessionByTokenHash(ds.manager, tokenHash);
    if (!session || session.revokedAt) throw Errors.authRequired();

    if (session.expiresAt.getTime() <= Date.now()) {
      await deleteSession(ds.manager, tokenHash);
      throw Errors.sessionExpired();
    }

    const user = await findUserById(ds.manager, session.userId);
    if (!user) throw Errors.authRequired();

    await touchSession(ds.manager, tokenHash);
    return {
      user: toSessionUser(user),
      sessionId: session.id,
      sessionExpiresAt: session.expiresAt,
    };
  },
};