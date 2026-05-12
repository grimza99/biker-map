import type {
  DeleteAccountResponseData,
  UpdateMeResponseData,
} from "@package-shared/types/auth";
import { BUCKET_NAME } from "@package-shared/constants/supabase";
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
import { createSupabaseServiceClient } from "@shared/lib/supabase";
import { getSupabasePublicEnv } from "@shared/config";
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
  const serviceSupabase = createSupabaseServiceClient();
  const previousAvatarUrl =
    typeof session.user.user_metadata?.avatar_url === "string"
      ? session.user.user_metadata.avatar_url
      : null;

  const { error: authError, data: authData } =
    await serviceSupabase.auth.admin.updateUserById(session.user.id, {
      user_metadata: {
        ...session.user.user_metadata,
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

  const previousAvatarPath = extractPublicBucketPath(previousAvatarUrl);
  if (previousAvatarPath && previousAvatarUrl !== payload.avatarUrl) {
    const { error: removeError } = await serviceSupabase.storage
      .from(BUCKET_NAME)
      .remove([previousAvatarPath]);

    if (removeError) {
      return internalServerError(removeError.message);
    }
  }

  return ok<UpdateMeResponseData>({
    session: mapMe(updatedSession, profileStatus?.role || "member").session,
  });
}

function extractPublicBucketPath(avatarUrl: string | null) {
  if (!avatarUrl) {
    return null;
  }

  try {
    const env = getSupabasePublicEnv();
    const storageBaseUrl = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
    const candidateUrl = new URL(avatarUrl);

    if (candidateUrl.origin !== storageBaseUrl.origin) {
      return null;
    }

    const publicPrefix = `/storage/v1/object/public/${BUCKET_NAME}/`;
    if (!candidateUrl.pathname.startsWith(publicPrefix)) {
      return null;
    }

    const path = decodeURIComponent(
      candidateUrl.pathname.slice(publicPrefix.length)
    );

    return path || null;
  } catch {
    return null;
  }
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
