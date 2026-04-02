import {
  badRequest,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
  mapRefreshData,
  ok,
  setRefreshTokenCookie,
} from "@shared/api";

import { createSupabaseAuthClient } from "@shared/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookie();
  if (!refreshToken) {
    return badRequest("refresh token cookie가 없습니다.");
  }

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  const response = ok(mapRefreshData(data.session, !error)) as NextResponse;

  if (data.session?.refresh_token) {
    setRefreshTokenCookie(response, data.session.refresh_token);
  } else if (error) {
    clearRefreshTokenCookie(response);
  }

  return response;
}
