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
  slugConflict: (slug: string): ApiError =>
    new ApiError(
      409,
      "AD_SLUG_CONFLICT",
      `An advertisement with the slug "${slug}" already exists.`,
    ),
  adNotFound: (): ApiError =>
    new ApiError(404, "AD_NOT_FOUND", "Advertisement not found."),
  invalidType: (): ApiError =>
    new ApiError(
      400,
      "INVALID_AD_TYPE",
      "Ad type must be one of: banner, text, sponsored.",
      [{ field: "type", issues: ["Must be one of: banner, text, sponsored."] }],
    ),
  invalidPlacement: (value: string): ApiError =>
    new ApiError(
      400,
      "INVALID_AD_PLACEMENT",
      `Ad placement "${value}" is not valid.`,
      [{
        field: "placement",
        issues: ["Must be one of: header, below-hero, sidebar, in-feed, in-content, popup."],
      }],
    ),
  invalidUrl: (field: string): ApiError =>
    new ApiError(
      400,
      "INVALID_AD_URL",
      `${field} must be an absolute http(s) URL.`,
      [{ field, issues: ["Must be an absolute http(s) URL."] }],
    ),
  mediaNotFound: (id: string): ApiError =>
    new ApiError(
      400,
      "INVALID_AD_MEDIA",
      `Image media id "${id}" does not exist.`,
      [{ field: "imageMediaId", issues: [`No media with id "${id}".`] }],
    ),
  invalidDateRange: (): ApiError =>
    new ApiError(
      400,
      "INVALID_AD_DATE_RANGE",
      "endDate must be on or after startDate.",
      [{
        field: "endDate",
        issues: ["Must not be earlier than startDate."],
      }],
    ),
} as const;