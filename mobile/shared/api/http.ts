import * as SecureStore from "expo-secure-store";

import { API_PATHS } from "@package-shared/constants/api";
import type {
  ApiError,
  ApiResponse,
  AppSession,
  AuthResponseData,
  RefreshResponseData,
} from "@package-shared/index";

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_KEY } from "../constants";

type ApiAuthState = AuthResponseData;
type ApiRequestBody = unknown;
type ApiFetchRequestInit = Omit<RequestInit, "body" | "method">;
type ApiRequestContext = {
  init: RequestInit;
  url: string;
};
type ApiResponseContext = ApiRequestContext & {
  payload: unknown;
  response: Response;
};
type RequestInterceptor = (
  context: ApiRequestContext
) => ApiRequestContext | Promise<ApiRequestContext>;
type ResponseInterceptor = (
  context: ApiResponseContext
) => void | Promise<void>;
type ApiFetchWithMethods = typeof apiFetchBase & {
  delete<T>(
    input: string | URL,
    init?: ApiFetchRequestInit
  ): Promise<ApiResponse<T>>;
  get<T>(
    input: string | URL,
    init?: ApiFetchRequestInit
  ): Promise<ApiResponse<T>>;
  patch<T>(
    input: string | URL,
    body?: ApiRequestBody,
    init?: ApiFetchRequestInit
  ): Promise<ApiResponse<T>>;
  post<T>(
    input: string | URL,
    body?: ApiRequestBody,
    init?: ApiFetchRequestInit
  ): Promise<ApiResponse<T>>;
};

const requestInterceptors = new Set<RequestInterceptor>();
const responseInterceptors = new Set<ResponseInterceptor>();

let apiAuthState: ApiAuthState = {
  accessToken: null,
  refreshToken: null,
  session: null,
};
let refreshPromise: Promise<string | null> | null = null;

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

export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.add(interceptor);

  return () => {
    requestInterceptors.delete(interceptor);
  };
}

export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.add(interceptor);

  return () => {
    responseInterceptors.delete(interceptor);
  };
}

export function getApiAuthState() {
  return apiAuthState;
}

export async function restoreApiAuthState() {
  const [accessToken, refreshToken, storedSession] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(SESSION_KEY),
  ]);

  const nextState: ApiAuthState = {
    accessToken: accessToken ?? null,
    refreshToken: refreshToken ?? null,
    session: parseStoredSession(storedSession),
  };

  apiAuthState = nextState;
  return nextState;
}

export async function persistAuthResponse(data: AuthResponseData) {
  const nextState: ApiAuthState = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    session: data.session,
  };

  await writeApiAuthState(nextState);
  return nextState;
}

export async function clearApiAuthState() {
  apiAuthState = {
    accessToken: null,
    refreshToken: null,
    session: null,
  };

  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(SESSION_KEY),
  ]);
}

export const apiFetch = Object.assign(apiFetchBase, {
  delete<T>(input: string | URL, init?: ApiFetchRequestInit) {
    return apiFetchBase<T>(input, buildMethodRequestInit("DELETE", init));
  },
  get<T>(input: string | URL, init?: ApiFetchRequestInit) {
    return apiFetchBase<T>(input, buildMethodRequestInit("GET", init));
  },
  patch<T>(
    input: string | URL,
    body?: ApiRequestBody,
    init?: ApiFetchRequestInit
  ) {
    return apiFetchBase<T>(input, buildBodyRequestInit("PATCH", body, init));
  },
  post<T>(
    input: string | URL,
    body?: ApiRequestBody,
    init?: ApiFetchRequestInit
  ) {
    return apiFetchBase<T>(input, buildBodyRequestInit("POST", body, init));
  },
}) satisfies ApiFetchWithMethods;

async function apiFetchBase<T>(
  input: string | URL,
  init?: RequestInit,
  retried = false
): Promise<ApiResponse<T>> {
  const prepared = await applyRequestInterceptors({
    init: buildRequestInit(init),
    url: buildApiUrl(input),
  });
  const response = await fetch(prepared.url, prepared.init);
  const payload = await response.json().catch(() => null);

  await applyResponseInterceptors({
    ...prepared,
    payload,
    response,
  });

  if (response.status === 401 && !retried) {
    const refreshedAccessToken = await refreshAccessToken();

    if (refreshedAccessToken) {
      return apiFetchBase<T>(input, init, true);
    }
  }

  if (!response.ok) {
    throw toApiClientError(payload, response.status);
  }

  return payload as ApiResponse<T>;
}

function buildMethodRequestInit(
  method: string,
  init?: ApiFetchRequestInit
): RequestInit {
  return {
    ...init,
    method,
  };
}

function buildBodyRequestInit(
  method: string,
  body?: ApiRequestBody,
  init?: ApiFetchRequestInit
): RequestInit {
  return {
    ...init,
    body: serializeRequestBody(body),
    method,
  };
}

function serializeRequestBody(body: ApiRequestBody): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  return JSON.stringify(body);
}

function isBodyInit(body: ApiRequestBody): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams)
  );
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken =
        apiAuthState.refreshToken ??
        (await SecureStore.getItemAsync(REFRESH_TOKEN_KEY));

      if (!refreshToken) {
        await clearApiAuthState();
        return null;
      }

      try {
        const response = await fetch(buildApiUrl(API_PATHS.auth.refresh), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Client-Platform": "mobile",
            "X-Refresh-Token": refreshToken,
          },
        });

        const payload = (await response.json().catch(() => null)) as
          | ApiResponse<RefreshResponseData>
          | ApiError
          | null;

        if (!response.ok) {
          await clearApiAuthState();
          return null;
        }

        const nextAccessToken = isApiResponse<RefreshResponseData>(payload)
          ? payload.data.accessToken
          : null;
        const nextRefreshToken = isApiResponse<RefreshResponseData>(payload)
          ? payload.data.refreshToken ?? refreshToken
          : refreshToken;

        if (!nextAccessToken) {
          await clearApiAuthState();
          return null;
        }

        await writeApiAuthState({
          ...apiAuthState,
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
        });

        return nextAccessToken;
      } catch {
        await clearApiAuthState();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function writeApiAuthState(nextState: ApiAuthState) {
  apiAuthState = nextState;

  await Promise.all([
    writeSecureValue(ACCESS_TOKEN_KEY, nextState.accessToken),
    writeSecureValue(REFRESH_TOKEN_KEY, nextState.refreshToken),
    writeSecureValue(
      SESSION_KEY,
      nextState.session ? JSON.stringify(nextState.session) : null
    ),
  ]);
}

function buildApiUrl(input: string | URL) {
  if (input instanceof URL) {
    return input.toString();
  }

  if (/^https?:\/\//.test(input)) {
    return input;
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new ApiClientError(
      "EXPO_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.",
      "MISSING_API_BASE_URL"
    );
  }

  return new URL(input, baseUrl).toString();
}

function buildRequestInit(init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const isFormDataBody = init?.body instanceof FormData;

  if (!isFormDataBody && init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("X-Client-Platform", "mobile");

  if (apiAuthState.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${apiAuthState.accessToken}`);
  }

  return {
    ...init,
    headers,
  };
}

async function applyRequestInterceptors(context: ApiRequestContext) {
  let nextContext = context;

  for (const interceptor of requestInterceptors) {
    nextContext = await interceptor(nextContext);
  }

  return nextContext;
}

async function applyResponseInterceptors(context: ApiResponseContext) {
  for (const interceptor of responseInterceptors) {
    await interceptor(context);
  }
}

async function writeSecureValue(key: string, value: string | null) {
  if (!value) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

function parseStoredSession(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AppSession;
  } catch {
    return null;
  }
}

function toApiClientError(payload: unknown, status: number) {
  if (isApiError(payload)) {
    return new ApiClientError(payload.message, payload.code, payload.details);
  }

  return new ApiClientError("요청 처리에 실패했습니다.", String(status));
}

function isApiError(payload: unknown): payload is ApiError {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      "code" in payload &&
      "message" in payload &&
      typeof payload.code === "string" &&
      typeof payload.message === "string"
  );
}

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  return Boolean(payload && typeof payload === "object" && "data" in payload);
}
