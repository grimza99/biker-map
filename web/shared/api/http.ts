import { apiErrorSchema } from "./contracts";
import type { ApiResponse } from "./types";

export class ApiClientError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code = "UNKNOWN_ERROR", details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(payload);
    if (parsed.success) {
      throw new ApiClientError(parsed.data.message, parsed.data.code, parsed.data.details);
    }

    throw new ApiClientError("요청 처리에 실패했습니다.", String(response.status));
  }

  return payload as ApiResponse<T>;
}
