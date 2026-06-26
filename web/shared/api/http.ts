import { ApiClientError } from "@package-shared/index";
import type { ApiResponse } from "@package-shared/types/api";
import { getSession } from "next-auth/react";
import { apiErrorSchema } from "./contracts";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let sessionRefreshHandler: (() => Promise<string | null>) | null = null;
const accessTokenListeners = new Set<(accessToken: string | null) => void>();

export function setApiAccessToken(nextAccessToken: string | null) {
  accessToken = nextAccessToken;

  for (const listener of accessTokenListeners) {
    listener(nextAccessToken);
  }
}

export function subscribeApiAccessToken(
  listener: (accessToken: string | null) => void
) {
  accessTokenListeners.add(listener);

  return () => {
    accessTokenListeners.delete(listener);
  };
}

export function setApiSessionRefreshHandler(
  handler: (() => Promise<string | null>) | null
) {
  sessionRefreshHandler = handler;
}

async function refreshAccessToken(forceRefresh = false) {
  if (!refreshPromise) {
    refreshPromise = (
      forceRefresh && sessionRefreshHandler
        ? sessionRefreshHandler()
        : getSession().then((session) => session?.accessToken ?? null)
    )
      .then((refreshedAccessToken) => {
        const nextAccessToken = refreshedAccessToken ?? null;
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
  const headers = new Headers(init?.headers);
  const isFormDataBody = init?.body instanceof FormData;

  if (!isFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 401 && !retried) {
    const refreshedAccessToken = await refreshAccessToken(true);

    if (refreshedAccessToken) {
      return apiFetch<T>(
        input,
        withAuthorizationHeader(init, refreshedAccessToken),
        true
      );
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

function withAuthorizationHeader(
  init: RequestInit | undefined,
  nextAccessToken: string
): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${nextAccessToken}`);

  return {
    ...init,
    headers,
  };
}
