import { ApiError, type ErrorDetail, type ErrorDetails } from "../api-errors";

export { ApiError };
export type { ErrorDetail, ErrorDetails };

export const Errors = {
  validation: (details: ErrorDetails): ApiError =>
    new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", details),
  invalidJson: (cause: string): ApiError =>
    new ApiError(400, "INVALID_JSON", `Request body is not valid JSON: ${cause}.`),
  /**
   * The singleton settings row is missing. The schema (id = 1 check) means
   * the row must exist once seeded; its absence is a database configuration
   * problem, so it surfaces as a server error rather than a 404 — and the
   * service never silently creates a second row.
   */
  settingsNotConfigured: (): ApiError =>
    new ApiError(
      500,
      "SETTINGS_NOT_CONFIGURED",
      "Site settings are not configured. Run the database seed (npm run db:seed) to create the single site_settings row.",
    ),
} as const;