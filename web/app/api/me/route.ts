import type {
  DeleteAccountResponseData,
  UpdateMeResponseData,
} from "@package-shared/types/auth";
import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  mapMe,
  ok,
  parseRequestBody,
  unauthorized,
} from "@shared/api";
import {
  clearRefreshTokenCookie,
  getSupabaseAuthSession,
} from "@shared/api/auth";
import { getProfileStatus } from "@shared/api/supabase-profiles";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(40),
  avatarUrl: z.string().url().nullable(),
});

export async function GET(request: Request) {
  const session = await getSupabaseAuthSession(request);
  if (!session) {
    return unauthorized();
  }

  const supabase = createSupabaseApiClient(request);
  let profileStatus = null;
  try {
    profileStatus = await getProfileStatus(supabase, session.user.id);
  } catch {
    return unauthorized();
  }

  if (profileStatus?.deletedAt) {
    return unauthorized("탈퇴 처리된 계정입니다.");
  }

  return ok(mapMe(session, profileStatus?.role || "member"));
}

export async function PATCH(request: Request) {
  const session = await getSupabaseAuthSession(request);
  if (!session) {
    return unauthorized();
  }

  let payload: z.infer<typeof updateMeSchema>;
  try {
    payload = await parseRequestBody(request, updateMeSchema);
  } catch {
    return badRequest("프로필 수정 요청이 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);

  const { error: authError, data: authData } = await supabase.auth.updateUser({
    data: {
      display_name: payload.name,
      avatar_url: payload.avatarUrl,
    },
  });

  if (authError) {
    return internalServerError(authError.message);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: payload.name,
    })
    .eq("id", session.user.id);

  if (profileError) {
    return internalServerError(profileError.message);
  }

  const profileStatus = await getProfileStatus(supabase, session.user.id);

  const updatedSession = {
    ...session,
    user: authData.user ?? {
      ...session.user,
      user_metadata: {
        ...session.user.user_metadata,
        display_name: payload.name,
        avatar_url: payload.avatarUrl,
      },
    },
  };

  return ok<UpdateMeResponseData>({
    session: mapMe(updatedSession, profileStatus?.role || "member").session,
  });
}

export async function DELETE(request: Request) {
  const session = await getSupabaseAuthSession(request);
  if (!session) {
    return unauthorized();
  }

  const supabase = createSupabaseApiClient(request);
  const deletedAt = new Date().toISOString();
  const purgeAfter = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabase
    .from("profiles")
    .update({
      deleted_at: deletedAt,
    })
    .eq("id", session.user.id);

  if (error) {
    return internalServerError(error.message);
  }

  const response = ok<DeleteAccountResponseData>({
    deleted: true,
    deletedAt,
    purgeAfter,
  }) as NextResponse;

  clearRefreshTokenCookie(response);
  return response;
}
