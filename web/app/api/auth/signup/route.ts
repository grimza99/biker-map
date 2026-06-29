import { NextResponse } from "next/server";

import {
  AuthResponseData,
  SignUpBody,
  signUpSchema,
} from "@package-shared/index";
import { badRequest, created, parseRequestBody } from "@shared/api";
import { setRefreshTokenCookie } from "@shared/api/auth";
import { isMobileClientRequest } from "@shared/api/auth.server";
import {
  createSupabaseAuthClient,
  mapSupabaseSession,
} from "@shared/lib/supabase";

export async function POST(request: Request) {
  const isMobileClient = isMobileClientRequest(request);
  let payload: SignUpBody;
  try {
    payload = await parseRequestBody(request, signUpSchema);
  } catch {
    return badRequest("회원가입 정보가 올바르지 않습니다.");
  }

  const supabase = createSupabaseAuthClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        display_name: payload.name,
      },
    },
  });

  if (error) {
    return badRequest(error.message);
  }

  const mappedSession = mapSupabaseSession(
    session,
    "member",
    null,
    null,
    "",
    false,
    null
  );

  const response = created<AuthResponseData>({
    session: mappedSession,
    accessToken: session?.access_token ?? null,
    refreshToken: isMobileClient ? session?.refresh_token ?? null : null,
  }) as NextResponse;

  if (session?.refresh_token) {
    setRefreshTokenCookie(response, session.refresh_token);
  }

  return response;
}
