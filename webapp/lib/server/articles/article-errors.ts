import { ApiError, errorBody, type ErrorDetail, type ErrorDetails } from "../api-errors";

export { ApiError, errorBody };
export type { ErrorDetail, ErrorDetails };

export const Errors = {
  validation: (details: ErrorDetails): ApiError =>
    new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", details),
  invalidJson: (cause: string): ApiError =>
    new ApiError(400, "INVALID_JSON", `Request body is not valid JSON: ${cause}.`),
  slugConflict: (slug: string): ApiError =>
    new ApiError(
      409,
      "ARTICLE_SLUG_CONFLICT",
      `An article with the slug "${slug}" already exists.`,
    ),
  articleNotFound: (): ApiError =>
    new ApiError(404, "ARTICLE_NOT_FOUND", "Article not found."),
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
  authorNotFound: (id: string): ApiError =>
    new ApiError(
      400,
      "INVALID_AUTHOR",
      `Author id "${id}" does not exist.`,
      [{ field: "authorId", issues: [`No user with id "${id}".`] }],
    ),
  mediaNotFound: (id: string): ApiError =>
    new ApiError(
      400,
      "INVALID_FEATURED_MEDIA",
      `Featured media id "${id}" does not exist.`,
      [{ field: "featuredMediaId", issues: [`No media with id "${id}".`] }],
    ),
} as const;