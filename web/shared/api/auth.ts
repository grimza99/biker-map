import type { Session, User } from "@supabase/supabase-js";

import type { AppSession } from "@package-shared/types/session";

import { refreshTokenCookieOptions } from "@shared/config";
import {
  createSupabaseAuthClient,
  mapSupabaseSession,
} from "@shared/lib/supabase";
import { forbidden, internalServerError, unauthorized } from "./response";
import { getProfileStatus } from "./supabase-profiles";

export type ActiveAppSessionResolution =
  | {
      status: "ok";
      authSession: Session;
      appSession: AppSession;
    }
  | {
      status: "unauthenticated";
    }
  | {
      status: "deleted";
      authSession: Session;
    }
  | {
      status: "error";
      authSession: Session;
      error: unknown;
    };

type ActiveSessionBundle = {
  authSession: Session;
  appSession: AppSession;
};

type RequireActiveSessionOptions = {
  unauthenticatedMessage?: string;
  deletedMessage?: string;
  deletedResponse?: "unauthorized" | "forbidden";
  errorMessage?: string;
  errorResponse?: "unauthorized" | "internalServerError";
  clearRefreshTokenOnDeleted?: boolean;
  clearRefreshTokenOnError?: boolean;
};

/**
 *
 * @param request - HTTP 요청 객체에서 Authorization 헤더를 파싱하여 Bearer 토큰을 추출합니다.
 * @returns Bearer 토큰 문자열 또는 유효하지 않은 경우 null을 반환합니다.
 */
export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

/**
 *
 * @param request - HTTP 요청 객체에서 Authorization 헤더를 파싱하여 Bearer 토큰을 추출한 후, 해당 토큰으로 Supabase 인증 세션을 조회합니다.
 * @returns Supabase 인증 세션 객체 또는 유효하지 않은 경우 null을 반환합니다.
 */
export async function getSupabaseAuthSession(
  request: Request
): Promise<Session | null> {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return null;
  }

  const supabase = createSupabaseAuthClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return toSessionFromBearerToken(accessToken, user);
}

/**
 *
 * @param session - Supabase Auth에서 확인된 세션을 받아 profile 보조 정보를 조회한 뒤,
 * 탈퇴 여부를 판정하고 최종 AppSession을 반환
 */
export async function resolveActiveAppSession(
  session: Session | null
): Promise<ActiveAppSessionResolution> {
  if (!session?.user) {
    return {
      status: "unauthenticated",
    };
  }

  let profileStatus;
  try {
    profileStatus = await getProfileStatus(session.user.id);
  } catch (error) {
    return {
      status: "error",
      authSession: session,
      error,
    };
  }

  if (profileStatus?.deletedAt) {
    return {
      status: "deleted",
      authSession: session,
    };
  }

  const appSession = mapSupabaseSession(
    session,
    profileStatus?.role,
    profileStatus?.bikeBrand ?? null,
    profileStatus?.bikeModel ?? null,
    profileStatus?.phone ?? "",
    profileStatus?.isVerified ?? false,
    profileStatus?.proficiency ?? null
  );

  if (!appSession) {
    return {
      status: "unauthenticated",
    };
  }

  return {
    status: "ok",
    authSession: session,
    appSession,
  };
}

export async function resolveActiveApiSession(
  request: Request
): Promise<ActiveAppSessionResolution> {
  const session = await getSupabaseAuthSession(request);
  return resolveActiveAppSession(session);
}

/**
 *
 * @param resolution - resolveActiveAppSession 또는 resolveActiveApiSession 결과
 * @param options - 실패 상태를 어떤 HTTP 응답으로 바꿀지 지정합니다.
 * @returns 활성 세션이면 auth/app 세션 묶음을, 아니면 공통 실패 Response를 반환합니다.
 */
export function requireResolvedActiveSession(
  resolution: ActiveAppSessionResolution,
  options: RequireActiveSessionOptions = {}
): ActiveSessionBundle | Response {
  if (resolution.status === "ok") {
    return {
      authSession: resolution.authSession,
      appSession: resolution.appSession,
    };
  }

  if (resolution.status === "deleted") {
    const responseFactory =
      options.deletedResponse === "forbidden" ? forbidden : unauthorized;
    const response = responseFactory(
      options.deletedMessage ?? "탈퇴 처리된 계정입니다."
    );

    if (options.clearRefreshTokenOnDeleted) {
      clearRefreshTokenCookie(response);
    }

    return response;
  }

  if (resolution.status === "error") {
    const response =
      options.errorResponse === "internalServerError"
        ? internalServerError(
            options.errorMessage ??
              (resolution.error instanceof Error
                ? resolution.error.message
                : "세션 상태를 확인하지 못했습니다.")
          )
        : unauthorized(
            options.errorMessage ?? "세션 상태를 확인하지 못했습니다."
          );

    if (options.clearRefreshTokenOnError) {
      clearRefreshTokenCookie(response);
    }

    return response;
  }

  return unauthorized(options.unauthenticatedMessage);
}

export async function requireActiveSupabaseSession(
  session: Session | null,
  options: RequireActiveSessionOptions = {}
): Promise<ActiveSessionBundle | Response> {
  const resolution = await resolveActiveAppSession(session);
  return requireResolvedActiveSession(resolution, options);
}

export async function requireActiveApiSession(
  request: Request,
  options: RequireActiveSessionOptions = {}
): Promise<ActiveSessionBundle | Response> {
  const resolution = await resolveActiveApiSession(request);
  return requireResolvedActiveSession(resolution, options);
}

/**
 *
 * @param request - HTTP 요청 객체에서 Authorization 헤더를 파싱하여 Bearer 토큰을 추출한 후, 해당 토큰으로 Supabase 인증 세션을 조회하고, 이를 애플리케이션의 AppSession 형태로 매핑하여 반환합니다.
 * @returns
 */
async function getApiSession(request: Request): Promise<AppSession | null> {
  const session = await requireActiveApiSession(request);
  if (session instanceof Response) {
    return null;
  }

  return session.appSession;
}

/**
 *
 * @param request - HTTP 요청 객체에서 Authorization 헤더를 파싱하여 Bearer 토큰을 추출한 후, 해당 토큰으로 Supabase 인증 세션을 조회하고, 유효한 세션이 존재하지 않을 경우 401 Unauthorized 응답을 반환합니다. 유효한 세션이 존재하는 경우, 이를 애플리케이션의 AppSession 형태로 매핑하여 반환합니다.
 * @returns
 */
export async function requireApiSession(request: Request) {
  const session = await getApiSession(request);
  if (!session) {
    return unauthorized();
  }

  return session;
}

export async function requireVerifiedApiSession(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  if (!session.isVerified) {
    return forbidden(
      "본인인증이 완료된 계정만 라이브 바이커를 사용할 수 있습니다."
    );
  }

  return session;
}

function toSessionFromBearerToken(accessToken: string, user: User): Session {
  return {
    access_token: accessToken,
    refresh_token: "",
    token_type: "bearer",
    expires_in: 0,
    user,
  };
}

/**---------------------------------------------------- refresh token handle--------------------------------------------------------*/
export function setRefreshTokenCookie(
  response: Response,
  refreshToken: string
) {
  const cookieStore = response.headers;
  const parts = [
    `${refreshTokenCookieOptions.name}=${encodeURIComponent(refreshToken)}`,
    `Path=${refreshTokenCookieOptions.path}`,
    `Max-Age=${refreshTokenCookieOptions.maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (refreshTokenCookieOptions.secure) {
    parts.push("Secure");
  }

  cookieStore.append("Set-Cookie", parts.join("; "));
}

export function clearRefreshTokenCookie(response: Response) {
  const cookieStore = response.headers;
  const parts = [
    `${refreshTokenCookieOptions.name}=`,
    `Path=${refreshTokenCookieOptions.path}`,
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (refreshTokenCookieOptions.secure) {
    parts.push("Secure");
  }

  cookieStore.append("Set-Cookie", parts.join("; "));
}

/**---------------------------------------------------- clear session --------------------------------------------------------*/
export function clearAuthSessionCookies(response: Response) {
  const cookieStore = response.headers;
  const secure = refreshTokenCookieOptions.secure;
  const sessionCookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];

  for (const name of sessionCookieNames) {
    const parts = [
      `${name}=`,
      `Path=${refreshTokenCookieOptions.path}`,
      "Max-Age=0",
      "HttpOnly",
      "SameSite=Lax",
    ];

    if (secure) {
      parts.push("Secure");
    }

    cookieStore.append("Set-Cookie", parts.join("; "));
  }
}
