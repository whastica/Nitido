import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiMeta {
  total?: number;
  page?: number;
  perPage?: number;
  hasMore?: boolean;
}

export interface ApiSuccessBody<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "AI_ERROR"
  | "INTERNAL_ERROR";

const HTTP_STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST:    400,
  UNAUTHORIZED:   401,
  FORBIDDEN:      403,
  NOT_FOUND:      404,
  CONFLICT:       409,
  UNPROCESSABLE:  422,
  QUOTA_EXCEEDED: 429,
  RATE_LIMITED:   429,
  AI_ERROR:       502,
  INTERNAL_ERROR: 500,
};

interface ApiResponseOptions {
  status?: number;
  meta?: ApiMeta;
  headers?: Record<string, string>;
}

export function apiResponse<T>(
  data: T,
  options: ApiResponseOptions = {}
): NextResponse<ApiSuccessBody<T>> {
  const { status = 200, meta, headers = {} } = options;
  const body: ApiSuccessBody<T> = { data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status?: number,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const httpStatus = status ?? HTTP_STATUS[code];
  const body: ApiErrorBody = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return NextResponse.json(body, { status: httpStatus });
}

export function fromZodError(error: ZodError): NextResponse<ApiErrorBody> {
  const details = error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
  return apiError("BAD_REQUEST", "Los datos enviados no son válidos", 400, details);
}

export async function catchApiError(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    if (err instanceof ApiRouteError) {
      return apiError(err.code, err.message, undefined, err.details);
    }
    if (err instanceof ZodError) {
      return fromZodError(err);
    }
    console.error("[API] Unhandled error:", err);
    return apiError("INTERNAL_ERROR", "Ocurrió un error inesperado. Inténtalo de nuevo.");
  }
}

export class ApiRouteError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiRouteError";
  }
}
