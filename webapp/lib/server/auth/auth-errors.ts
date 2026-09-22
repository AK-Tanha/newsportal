import { ApiError, type ErrorDetails } from "../api-errors";

export { ApiError };
export type { ErrorDetails };

/**
 * Authentication failures use a generic message where possible so they never
 * reveal whether an email exists or which account owns a session.
 */
export const Errors = {
  authRequired: (): ApiError =>
    new ApiError(401, "AUTH_REQUIRED", "Authentication required."),

  invalidCredentials: (): ApiError =>
    new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password."),

  sessionExpired: (): ApiError =>
    new ApiError(401, "SESSION_EXPIRED", "Your session has expired. Please sign in again."),

  forbidden: (): ApiError =>
    new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action."),

  invalidLogin: (details: ErrorDetails): ApiError =>
    new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", details),
} as const;