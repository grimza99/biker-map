import type {
  CreateReactionBody,
  CreateReactionResponseData,
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
  const { error: toggleError } = await supabase.rpc("toggle_reaction", {
    input_target_type: payload.targetType,
    input_target_id: payload.targetId,
    input_reaction: payload.reaction,
  });

  if (toggleError) {
    if (toggleError.message.includes("반응 대상을 찾을 수 없습니다.")) {
      return notFound("반응 대상을 찾을 수 없습니다.");
    }

    return internalServerError(toggleError.message);
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
