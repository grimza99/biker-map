import { NextResponse } from "next/server";

import {
  AuthResponseData,
  type LoginBody,
  loginSchema,
} from "@package-shared/index";

import { badRequest, forbidden, ok, parseRequestBody } from "@shared/api";
import {
  clearRefreshTokenCookie,
  resolveActiveAppSession,
  setRefreshTokenCookie,
} from "@shared/api/auth";
import { isMobileClientRequest } from "@shared/api/auth.server";
import {
  createSupabaseAuthClient,
  mapSupabaseSession,
} from "@shared/lib/supabase";

/**--------------------------login------------------------------- */
export async function POST(request: Request) {
  const isMobileClient = isMobileClientRequest(request);
  let payload: LoginBody;
  try {
    payload = await parseRequestBody(request, loginSchema);
  } catch {
    return badRequest("로그인 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseAuthClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    return badRequest(error.message);
  }

  if (!session) {
    return badRequest("로그인 세션을 확인할 수 없습니다.");
  }

  const activeSession = await resolveActiveAppSession(session);
  if (activeSession.status === "deleted") {
    const response = forbidden(
      "탈퇴 처리된 계정입니다. 복구가 필요하면 관리자에게 문의해 주세요."
    ) as NextResponse;
    clearRefreshTokenCookie(response);
    return response;
  }

  if (activeSession.status === "unauthenticated") {
    return badRequest("로그인 사용자 정보를 확인할 수 없습니다.");
  }

  const mappedSession =
    activeSession.status === "ok"
      ? activeSession.appSession
      : mapSupabaseSession(session, "member", null, null, "", false, null);

  if (!mappedSession) {
    return badRequest("로그인 사용자 정보를 확인할 수 없습니다.");
  }

  const response = ok<AuthResponseData>({
    session: mappedSession,
    accessToken: session.access_token,
    refreshToken: isMobileClient ? session.refresh_token : null,
  }) as NextResponse;

  setRefreshTokenCookie(response, session.refresh_token);

  return response;
}
