import { ApiError, type ErrorDetail, type ErrorDetails } from "../api-errors";

export { ApiError };
export type { ErrorDetail, ErrorDetails };

export const Errors = {
  validation: (details: ErrorDetails): ApiError =>
    new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", details),
  invalidJson: (cause: string): ApiError =>
    new ApiError(400, "INVALID_JSON", `Request body is not valid JSON: ${cause}.`),
  invalidId: (field: string): ApiError =>
    new ApiError(
      400,
      "INVALID_ID",
      `"${field}" must be a positive integer.`,
      [{ field, issues: ["Must be a positive integer."] }],
    ),
  mediaNotFound: (): ApiError =>
    new ApiError(404, "MEDIA_NOT_FOUND", "Media record not found."),
  invalidType: (): ApiError =>
    new ApiError(
      400,
      "INVALID_MEDIA_TYPE",
      "Media type must be one of: image, video.",
      [{ field: "type", issues: ["Must be one of: image, video."] }],
    ),
  invalidUrl: (): ApiError =>
    new ApiError(
      400,
      "INVALID_MEDIA_URL",
      "url must be an absolute http(s) URL.",
      [{ field: "url", issues: ["Must be an absolute http(s) URL."] }],
    ),
  invalidFilename: (): ApiError =>
    new ApiError(
      400,
      "INVALID_MEDIA_FILENAME",
      "filename must be a non-empty string of at most 255 characters.",
      [{ field: "filename", issues: ["Must be a non-empty string of at most 255 characters."] }],
    ),
  invalidSize: (): ApiError =>
    new ApiError(
      400,
      "INVALID_MEDIA_SIZE",
      "size must be a non-negative integer.",
      [{ field: "size", issues: ["Must be a non-negative integer."] }],
    ),
  invalidDimensions: (field: "width" | "height"): ApiError =>
    new ApiError(
      400,
      "INVALID_MEDIA_DIMENSIONS",
      `${field} must be a non-negative integer.`,
      [{ field, issues: ["Must be a non-negative integer."] }],
    ),
} as const;