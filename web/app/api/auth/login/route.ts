import { AuthResponseData, type LoginBody } from "@package-shared/types/auth";
import {
  badRequest,
  forbidden,
  internalServerError,
  ok,
  parseRequestBody,
} from "@shared/api";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "@shared/api/auth";
import { getProfileStatus } from "@shared/api/supabase-profiles";
import { createSupabaseAuthClient, mapSupabaseSession } from "@shared/lib/supabase";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
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

  const mappedSession = mapSupabaseSession(session);
  if (!mappedSession) {
    return badRequest("로그인 사용자 정보를 확인할 수 없습니다.");
  }

  let profileStatus = null;
  try {
    profileStatus = await getProfileStatus(supabase, mappedSession.userId);
  } catch (profileError) {
    return internalServerError(
      profileError instanceof Error
        ? profileError.message
        : "프로필 상태를 확인하지 못했습니다."
    );
  }

  if (profileStatus?.deletedAt) {
    const response = forbidden(
      "탈퇴 처리된 계정입니다. 복구가 필요하면 관리자에게 문의해 주세요."
    ) as NextResponse;
    clearRefreshTokenCookie(response);
    return response;
  }

  const response = ok<AuthResponseData>({
    session: mappedSession,
    accessToken: session.access_token,
  }) as NextResponse;

  setRefreshTokenCookie(response, session.refresh_token);

  return response;
}
