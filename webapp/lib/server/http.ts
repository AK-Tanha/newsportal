import { ApiError, errorBody } from "./api-errors";

export function ok(data: unknown, init?: { status?: number; headers?: Record<string, string> }): Response {
  return Response.json(data, {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
}

export function noContent(init?: { headers?: Record<string, string> }): Response {
  return new Response(null, { status: 204, headers: init?.headers });
}

export function failure(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(errorBody(error), { status: error.status });
  }
  console.error("Unhandled API error:", error);
  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while processing the request.",
      },
    },
    { status: 500 },
  );
}