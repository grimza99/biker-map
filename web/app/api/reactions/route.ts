import type {
  CreateReactionBody,
  CreateReactionResponseData,
  ReactionType,
} from "@package-shared/types/reaction";
import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  loadSingleReactionSummary,
  notFound,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { z } from "zod";

const createReactionSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string().uuid(),
  reaction: z.enum(["like", "dislike"]),
});

function getOppositeReaction(reaction: ReactionType): ReactionType {
  return reaction === "like" ? "dislike" : "like";
}

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CreateReactionBody;
  try {
    payload = await parseRequestBody(request, createReactionSchema);
  } catch {
    return badRequest("반응 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);
  const targetTable = payload.targetType === "post" ? "posts" : "comments";
  const { data: target, error: targetError } = await supabase
    .from(targetTable)
    .select("id")
    .eq("id", payload.targetId)
    .maybeSingle();

  if (targetError) {
    return internalServerError(targetError.message);
  }

  if (!target) {
    return notFound("반응 대상을 찾을 수 없습니다.");
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("reactions")
    .select("id, reaction")
    .eq("user_id", session.userId)
    .eq("target_type", payload.targetType)
    .eq("target_id", payload.targetId);

  if (existingError) {
    return internalServerError(existingError.message);
  }

  const sameReaction = (existingRows ?? []).find(
    (row) => row.reaction === payload.reaction
  );
  const oppositeReaction = (existingRows ?? []).find(
    (row) => row.reaction === getOppositeReaction(payload.reaction)
  );

  if (sameReaction) {
    const { error: deleteError } = await supabase
      .from("reactions")
      .delete()
      .eq("id", sameReaction.id);

    if (deleteError) {
      return internalServerError(deleteError.message);
    }
  } else {
    if (oppositeReaction) {
      const { error: deleteError } = await supabase
        .from("reactions")
        .delete()
        .eq("id", oppositeReaction.id);

      if (deleteError) {
        return internalServerError(deleteError.message);
      }
    }

    const { error: insertError } = await supabase.from("reactions").insert({
      user_id: session.userId,
      target_type: payload.targetType,
      target_id: payload.targetId,
      reaction: payload.reaction,
    });

    if (insertError) {
      return internalServerError(insertError.message);
    }
  }

  const summary = await loadSingleReactionSummary(
    payload.targetType,
    payload.targetId,
    session.userId
  );

  return ok<CreateReactionResponseData>({
    targetType: payload.targetType,
    targetId: payload.targetId,
    likeCount: summary.likeCount,
    dislikeCount: summary.dislikeCount,
    myReaction: summary.myReaction,
  });
}
