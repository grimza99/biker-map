import type { AppSession } from "@package-shared/types/session";
import type { Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { refreshTokenCookieOptions } from "@shared/config";
import { createSupabaseAuthClient, mapSupabaseSession } from "@shared/lib/supabase";
import { unauthorized } from "./response";

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
 * @param request - HTTP 요청 객체에서 Authorization 헤더를 파싱하여 Bearer 토큰을 추출한 후, 해당 토큰으로 Supabase 인증 세션을 조회하고, 이를 애플리케이션의 AppSession 형태로 매핑하여 반환합니다.
 * @returns
 */
async function getApiSession(request: Request): Promise<AppSession | null> {
  const session = await getSupabaseAuthSession(request);
  return mapSupabaseSession(session ?? null);
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

export async function getRefreshTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(refreshTokenCookieOptions.name)?.value ?? null;
}
