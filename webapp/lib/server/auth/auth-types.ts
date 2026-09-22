import type { UserRole } from "../db/entities/enums";
import { USER_ROLES } from "../db/entities/enums";

export type { UserRole };
export const AUTH_ROLES = USER_ROLES;

/** Safe user projection returned by the auth layer (never contains the hash). */
export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/** Result of a successful server-side authentication. */
export interface AuthContext {
  user: SessionUser;
  /** Row id of the active session (internal; never serialized to clients). */
  sessionId: string;
  sessionExpiresAt: Date;
}

/** Default session lifetime in days (overridable via SESSION_TTL_DAYS). */
export const DEFAULT_SESSION_TTL_DAYS = 30;