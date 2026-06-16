import { z } from "zod";

import type { CreateFavoriteBody, FavoriteTargetType } from "@package-shared/types/favorite";

import {
  badRequest,
  created,
  createSupabaseApiClient,
  internalServerError,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";

const createFavoriteSchema = z.object({
  targetType: z.enum(["post", "route"]),
  targetId: z.string().uuid(),
});

async function ensureTargetExists(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  targetType: FavoriteTargetType,
  targetId: string
) {
  const table = targetType === "post" ? "posts" : "routes";
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", targetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.id);
}

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CreateFavoriteBody;
  try {
    payload = await parseRequestBody(request, createFavoriteSchema);
  } catch {
    return badRequest("즐겨찾기 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);

  try {
    const exists = await ensureTargetExists(
      supabase,
      payload.targetType,
      payload.targetId
    );

    if (!exists) {
      return badRequest("즐겨찾기 대상을 찾을 수 없습니다.");
    }

    const { data: existing, error: existingError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", session.userId)
      .eq("target_type", payload.targetType)
      .eq("target_id", payload.targetId)
      .maybeSingle();

    if (existingError) {
      return internalServerError(existingError.message);
    }

    if (existing?.id) {
      return ok({
        id: String(existing.id),
        targetType: payload.targetType,
        targetId: payload.targetId,
      });
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: session.userId,
        target_type: payload.targetType,
        target_id: payload.targetId,
      })
      .select("id, target_type, target_id")
      .single();

    if (error) {
      return internalServerError(error.message);
    }

    return created({
      id: String(data.id),
      targetType: payload.targetType,
      targetId: payload.targetId,
    });
  } catch (error) {
    return internalServerError(
      error instanceof Error ? error.message : "즐겨찾기를 생성하지 못했습니다."
    );
  }
}
