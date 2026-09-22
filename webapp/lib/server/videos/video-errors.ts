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
      "VIDEO_SLUG_CONFLICT",
      `A video with the slug "${slug}" already exists.`,
    ),
  videoNotFound: (): ApiError =>
    new ApiError(404, "VIDEO_NOT_FOUND", "Video not found."),
  invalidId: (field: string): ApiError =>
    new ApiError(
      400,
      "INVALID_ID",
      `"${field}" must be a positive integer.`,
      [{ field, issues: ["Must be a positive integer."] }],
    ),
  invalidSlug: (): ApiError =>
    new ApiError(400, "INVALID_SLUG", "Path slug is invalid."),
  categoryNotFound: (slug: string): ApiError =>
    new ApiError(
      400,
      "INVALID_CATEGORY",
      `Category "${slug}" does not exist.`,
      [{ field: "category", issues: [`No category with slug "${slug}".`] }],
    ),
  authorNotFound: (id: string): ApiError =>
    new ApiError(
      400,
      "INVALID_AUTHOR",
      `Author id "${id}" does not exist.`,
      [{ field: "authorId", issues: [`No user with id "${id}".`] }],
    ),
  posterMediaNotFound: (id: string): ApiError =>
    new ApiError(
      400,
      "INVALID_POSTER_MEDIA",
      `Poster media id "${id}" does not exist.`,
      [{ field: "posterMediaId", issues: [`No media with id "${id}".`] }],
    ),
  invalidVideoUrl: (): ApiError =>
    new ApiError(
      400,
      "INVALID_VIDEO_URL",
      "videoUrl must be an absolute http(s) URL.",
      [{ field: "videoUrl", issues: ["Must be an absolute http(s) URL."] }],
    ),
} as const;