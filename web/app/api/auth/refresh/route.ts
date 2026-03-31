import { NextResponse } from "next/server";
import { badRequest, ok } from "@shared/api";
import { clearRefreshTokenCookie, getRefreshTokenFromCookie, setRefreshTokenCookie, toRefreshResponseData } from "@shared/api/auth";
import { createSupabaseAuthClient } from "@shared/lib";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookie();
  if (!refreshToken) {
    return badRequest("refresh token cookie가 없습니다.");
  }

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  });

  const response = ok(toRefreshResponseData(data.session, !error)) as NextResponse;

  if (data.session?.refresh_token) {
    setRefreshTokenCookie(response, data.session.refresh_token);
  } else if (error) {
    clearRefreshTokenCookie(response);
  }

  return response;
}
