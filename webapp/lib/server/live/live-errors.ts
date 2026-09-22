import { ApiError, type ErrorDetail, type ErrorDetails } from "../api-errors";

export { ApiError };
export type { ErrorDetail, ErrorDetails };

export const Errors = {
  validation: (details: ErrorDetails): ApiError =>
    new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", details),
  invalidJson: (cause: string): ApiError =>
    new ApiError(400, "INVALID_JSON", `Request body is not valid JSON: ${cause}.`),
  slugConflict: (slug: string): ApiError =>
    new ApiError(
      409,
      "LIVE_SLUG_CONFLICT",
      `A live stream with the slug "${slug}" already exists.`,
    ),
  activeConflict: (): ApiError =>
    new ApiError(
      409,
      "LIVE_ALREADY_ACTIVE",
      "Another live stream is already active. Only one stream can be live at a time.",
    ),
  liveNotFound: (): ApiError =>
    new ApiError(404, "LIVE_STREAM_NOT_FOUND", "Live stream not found."),
  invalidId: (field: string): ApiError =>
    new ApiError(
      400,
      "INVALID_ID",
      `"${field}" must be a positive integer.`,
      [{ field, issues: ["Must be a positive integer."] }],
    ),
  categoryNotFound: (slug: string): ApiError =>
    new ApiError(
      400,
      "INVALID_CATEGORY",
      `Category "${slug}" does not exist.`,
      [{ field: "category", issues: [`No category with slug "${slug}".`] }],
    ),
  posterMediaNotFound: (id: string): ApiError =>
    new ApiError(
      400,
      "INVALID_POSTER_MEDIA",
      `Poster media id "${id}" does not exist.`,
      [{ field: "posterMediaId", issues: [`No media with id "${id}".`] }],
    ),
  invalidStreamUrl: (): ApiError =>
    new ApiError(
      400,
      "INVALID_STREAM_URL",
      "streamUrl must be an absolute http(s) URL or null.",
      [{ field: "streamUrl", issues: ["Must be an absolute http(s) URL or null."] }],
    ),
} as const;