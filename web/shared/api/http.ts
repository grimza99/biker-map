import { API_PATHS } from "@package-shared/constants/api";
import type { ApiResponse } from "@package-shared/types/api";
import { apiErrorSchema } from "./contracts";

export class ApiClientError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code = "UNKNOWN_ERROR",
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setApiAccessToken(nextAccessToken: string | null) {
  accessToken = nextAccessToken;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(API_PATHS.auth.refresh, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          setApiAccessToken(null);
          return null;
        }

        const payload = (await response
          .json()
          .catch(() => null)) as ApiResponse<{
          accessToken: string | null;
        }> | null;

        const nextAccessToken = payload?.data?.accessToken ?? null;
        setApiAccessToken(nextAccessToken);
        return nextAccessToken;
      })
      .catch(() => {
        setApiAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  retried = false
): Promise<ApiResponse<T>> {
  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 401 && !retried) {
    const refreshedAccessToken = await refreshAccessToken();

    if (refreshedAccessToken) {
      return apiFetch<T>(input, init, true);
    }
  }

  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(payload);
    if (parsed.success) {
      throw new ApiClientError(
        parsed.data.message,
        parsed.data.code,
        parsed.data.details
      );
    }

    throw new ApiClientError(
      "요청 처리에 실패했습니다.",
      String(response.status)
    );
  }

  return payload as ApiResponse<T>;
}
