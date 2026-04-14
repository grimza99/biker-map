import type { DeleteAccountResponseData } from "@package-shared/types/auth";
import {
  createSupabaseApiClient,
  internalServerError,
  mapMe,
  ok,
  unauthorized,
} from "@shared/api";
import {
  clearRefreshTokenCookie,
  getSupabaseAuthSession,
} from "@shared/api/auth";
import { getProfileStatus } from "@shared/api/supabase-profiles";
import { NextResponse } from "next/server";

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

  return ok(mapMe(session));
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
