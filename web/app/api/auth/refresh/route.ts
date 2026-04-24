import {
  badRequest,
  forbidden,
  internalServerError,
  mapRefreshData,
  ok,
} from "@shared/api";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@shared/api/auth";
import { getRefreshTokenFromCookie } from "@shared/api/auth.server";
import { getProfileStatus } from "@shared/api/supabase-profiles";

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

  if (data.session?.user?.id) {
    let profileStatus = null;
    try {
      profileStatus = await getProfileStatus(supabase, data.session.user.id);
    } catch (profileError) {
      const errorResponse = internalServerError(
        profileError instanceof Error
          ? profileError.message
          : "프로필 상태를 확인하지 못했습니다."
      ) as NextResponse;
      clearRefreshTokenCookie(errorResponse);
      return errorResponse;
    }

    if (profileStatus?.deletedAt) {
      const deletedResponse = forbidden(
        "탈퇴 처리된 계정입니다. 더 이상 세션을 갱신할 수 없습니다."
      ) as NextResponse;
      clearRefreshTokenCookie(deletedResponse);
      return deletedResponse;
    }
  }

  const response = ok(mapRefreshData(data.session, !error)) as NextResponse;

  if (data.session?.refresh_token) {
    setRefreshTokenCookie(response, data.session.refresh_token);
  } else if (error) {
    clearRefreshTokenCookie(response);
  }

  return response;
}
