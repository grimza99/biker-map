import type { AuthResponseData, SignUpBody } from "@package-shared/types/auth";
import { badRequest, created, parseRequestBody } from "@shared/api";
import { setRefreshTokenCookie } from "@shared/api/auth";
import { createSupabaseAuthClient, mapSupabaseSession } from "@shared/lib/supabase";
import { NextResponse } from "next/server";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(40),
});

export async function POST(request: Request) {
  let payload: SignUpBody;
  try {
    payload = await parseRequestBody(request, signUpSchema);
  } catch {
    return badRequest("회원가입 정보가 올바르지 않습니다.");
  }

  const supabase = createSupabaseAuthClient();
  const {
    data: { session, user },
    error,
  } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
      },
    },
  });

  if (error) {
    return badRequest(error.message);
  }

  const mappedSession = mapSupabaseSession(session);

  const response = created<AuthResponseData>({
    session: mappedSession,
    accessToken: session?.access_token ?? null,
  }) as NextResponse;

  if (session?.refresh_token) {
    setRefreshTokenCookie(response, session.refresh_token);
  }

  return response;
}
