import type {
  ApiError,
  ApiResponse,
  ApiResponseMeta,
} from "@package-shared/types/api";
import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit, meta?: ApiResponseMeta) {
  return NextResponse.json({ data, meta } satisfies ApiResponse<T>, init);
}

export function created<T>(data: T, meta?: ApiResponseMeta) {
  return ok(data, { status: 201 }, meta);
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  return NextResponse.json({ code, message, details } satisfies ApiError, {
    status,
  });
}

export function badRequest(message: string, details?: Record<string, unknown>) {
  return errorResponse(400, "VALIDATION_ERROR", message, details);
}

export function unauthorized(message = "로그인이 필요합니다.") {
  return errorResponse(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "권한이 없습니다.") {
  return errorResponse(403, "FORBIDDEN", message);
}

export function notFound(message = "리소스를 찾을 수 없습니다.") {
  return errorResponse(404, "NOT_FOUND", message);
}

export function notImplemented(message = "not implemented") {
  return errorResponse(501, "NOT_IMPLEMENTED", message);
}
