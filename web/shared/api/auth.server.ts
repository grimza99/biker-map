import "server-only";

import { cookies } from "next/headers";

import { refreshTokenCookieOptions } from "@shared/config";

export async function getRefreshTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(refreshTokenCookieOptions.name)?.value ?? null;
}
