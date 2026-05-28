import "server-only";

import { cookies } from "next/headers";

import { refreshTokenCookieOptions } from "@shared/config";

export async function getRefreshTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(refreshTokenCookieOptions.name)?.value ?? null;
}

export function isMobileClientRequest(request: Request) {
  return request.headers.get("x-client-platform")?.toLowerCase() === "mobile";
}

export async function getRefreshTokenFromRequest(request: Request) {
  if (isMobileClientRequest(request)) {
    const refreshToken = request.headers.get("x-refresh-token")?.trim();

    if (refreshToken) {
      return refreshToken;
    }
  }

  return getRefreshTokenFromCookie();
}
