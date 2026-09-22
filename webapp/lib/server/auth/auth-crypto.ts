import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/**
 * One-way hashing of user passwords using bcrypt (established, salted KDF).
 * Passwords are never stored, logged, or returned by any endpoint — only the
 * hash exists in the users.password_hash column.
 */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Constant-time comparison of a candidate password against a stored hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    // Malformed or unreadable stored hash (e.g. the old seed placeholder)
    // must simply fail closed, never crash or reveal anything.
    return false;
  }
}

/**
 * High-entropy random session identifier. 32 random bytes base64url-encoded.
 * This value exists only in the HttpOnly cookie; never in the database.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 of a session token — the only form ever persisted. */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Rejects malformed cookie values (too short/long or wrong charset) safely. */
export function isValidSessionToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,128}$/.test(token);
}