import type {
  MeResponseData,
  RefreshResponseData,
} from "@package-shared/types/auth";
import type { AppSession } from "@package-shared/types/session";
import type { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { refreshTokenCookieOptions } from "@shared/config";
import { createSupabaseAuthClient, mapSupabaseSession } from "@shared/lib";
import { unauthorized } from "./response";

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function getSupabaseAuthSession(
  request: Request
): Promise<Session | null> {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return null;
  }
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return null;
  }

  const supabase = createSupabaseAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: "",
    token_type: "bearer",
    expires_in: 0,
    user,
  };
}

export async function getApiSession(
  request: Request
): Promise<AppSession | null> {
  const session = await getSupabaseAuthSession(request);
  return mapSupabaseSession(session);
}

export async function requireApiSession(request: Request) {
  const session = await getApiSession(request);
  if (!session) {
    return unauthorized();
  }

  return session;
}

export function toMeResponseData(session: Session | null): MeResponseData {
  return {
    authenticated: Boolean(session?.user),
    session: mapSupabaseSession(session),
  };
}

export function toRefreshResponseData(
  session: Session | null,
  refreshed: boolean
): RefreshResponseData {
  return {
    refreshed,
    accessToken: session?.access_token ?? null,
  };
}

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
