import {
  BUCKET_NAME,
  DeleteAccountResponseData,
  TUpdateProfileSchema,
  UpdateMeResponseData,
  updateMeSchema,
} from "@biker-map/package-shared";

import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  ok,
  parseRequestBody,
  unauthorized,
} from "@shared/api";
import {
  clearRefreshTokenCookie,
  requireActiveApiSession,
  resolveActiveAppSession,
} from "@shared/api/auth";
import { getSupabasePublicEnv } from "@shared/config";
import { createSupabaseServiceClient } from "@shared/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const activeSession = await requireActiveApiSession(request);
  if (activeSession instanceof Response) {
    return activeSession;
  }

  return ok({
    authenticated: true,
    session: activeSession.appSession,
  });
}

/**---------------------------------name, email, bikeBrand, bikeModel edit ---------------------- */
export async function PATCH(request: Request) {
  const activeSession = await requireActiveApiSession(request);
  if (activeSession instanceof Response) {
    return activeSession;
  }

  const session = activeSession.authSession;

  let payload: TUpdateProfileSchema;
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
      bike_brand: payload.bikeBrand,
      bike_model: payload.bikeModel,
      proficiency: payload.proficiency,
      avatar_url: payload.avatarUrl,
    })
    .eq("id", session.user.id);

  if (profileError) {
    return internalServerError(profileError.message);
  }

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

  const updatedActiveSession = await resolveActiveAppSession(updatedSession);
  if (updatedActiveSession.status === "error") {
    return internalServerError("수정된 세션 정보를 다시 확인하지 못했습니다.");
  }
  if (updatedActiveSession.status !== "ok") {
    return unauthorized("수정된 세션을 확인할 수 없습니다.");
  }

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
    session: updatedActiveSession.appSession,
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

/**---------------------------------draw user---------------------------------- */

export async function DELETE(request: Request) {
  const activeSession = await requireActiveApiSession(request);
  if (activeSession instanceof Response) {
    return activeSession;
  }

  const session = activeSession.authSession;
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
