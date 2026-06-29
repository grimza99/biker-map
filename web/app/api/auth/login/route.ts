import { NextResponse } from "next/server";

import {
  AuthResponseData,
  type LoginBody,
  loginSchema,
} from "@package-shared/index";

import { badRequest, forbidden, ok, parseRequestBody } from "@shared/api";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@shared/api/auth";
import { isMobileClientRequest } from "@shared/api/auth.server";
import { getProfileStatus } from "@shared/api/supabase-profiles";
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

  let profileStatus = null;
  try {
    profileStatus = await getProfileStatus(session.user.id);
  } catch {
    profileStatus = null;
  }

  if (profileStatus?.deletedAt) {
    const response = forbidden(
      "탈퇴 처리된 계정입니다. 복구가 필요하면 관리자에게 문의해 주세요."
    ) as NextResponse;
    clearRefreshTokenCookie(response);
    return response;
  }

  const mappedSession = mapSupabaseSession(
    session,
    profileStatus?.role,
    profileStatus?.bikeBrand ?? null,
    profileStatus?.bikeModel ?? null,
    profileStatus?.phone ?? "",
    profileStatus?.isVerified || false,
    profileStatus?.proficiency ?? null
  );
  if (!mappedSession) {
    return badRequest("로그인 사용자 정보를 확인할 수 없습니다.");
  }
  const response = ok<AuthResponseData>({
    session: {
      ...mappedSession,
      role: profileStatus?.role || "member",
    },
    accessToken: session.access_token,
    refreshToken: isMobileClient ? session.refresh_token : null,
  }) as NextResponse;

  setRefreshTokenCookie(response, session.refresh_token);

  return response;
}
