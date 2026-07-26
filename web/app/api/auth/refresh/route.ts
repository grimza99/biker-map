import {
  badRequest,
  mapRefreshData,
  ok,
} from "@shared/api";
import {
  clearRefreshTokenCookie,
  requireActiveSupabaseSession,
  setRefreshTokenCookie,
} from "@shared/api/auth";
import {
  getRefreshTokenFromRequest,
  isMobileClientRequest,
} from "@shared/api/auth.server";

import { createSupabaseAuthClient } from "@shared/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const isMobileClient = isMobileClientRequest(request);
  const refreshToken = await getRefreshTokenFromRequest(request);
  if (!refreshToken) {
    return badRequest("refresh token이 없습니다.");
  }

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (data.session) {
    const activeSession = await requireActiveSupabaseSession(data.session, {
      deletedMessage:
        "탈퇴 처리된 계정입니다. 더 이상 세션을 갱신할 수 없습니다.",
      deletedResponse: "forbidden",
      errorResponse: "internalServerError",
      errorMessage: "프로필 상태를 확인하지 못했습니다.",
      clearRefreshTokenOnDeleted: true,
      clearRefreshTokenOnError: true,
    });
    if (activeSession instanceof Response) {
      return activeSession;
    }
  }

  const response = ok(
    mapRefreshData(
      data.session,
      !error,
      isMobileClient ? data.session?.refresh_token ?? null : null
    )
  ) as NextResponse;

  if (data.session?.refresh_token) {
    setRefreshTokenCookie(response, data.session.refresh_token);
  } else if (error) {
    clearRefreshTokenCookie(response);
  }

  return response;
}
