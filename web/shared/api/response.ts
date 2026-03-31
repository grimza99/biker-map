import { NextResponse } from "next/server";
import type { ApiError, ApiResponse } from "@package-shared/types/api";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data } satisfies ApiResponse<T>, init);
}

export function notImplemented(message = "not implemented") {
  return NextResponse.json({ code: "NOT_IMPLEMENTED", message } satisfies ApiError, { status: 501 });
}
