export interface ErrorDetail {
  field: string;
  issues: string[];
}

export type ErrorDetails = ErrorDetail[];

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ErrorDetails;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: ErrorDetails,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Returns the supported HTTP error body for an ApiError. */
export function errorBody(error: ApiError): {
  error: { code: string; message: string; details?: ErrorDetails };
} {
  const body: { code: string; message: string; details?: ErrorDetails } = {
    code: error.code,
    message: error.message,
  };
  if (error.details?.length) body.details = error.details;
  return { error: body };
}