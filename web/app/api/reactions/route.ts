import { notImplemented } from "@shared/api";
// import { z } from "zod";

// const createReactionSchema = z.object({
//   targetType: z.enum(["post", "comment"]),
//   targetId: z.string().min(1),
//   reaction: z.literal("like"),
// });

export async function POST(request: Request) {
  return notImplemented("reaction은 MVP에서 제외되었습니다.");

  // const session = await requireApiSession(request);
  // if (session instanceof Response) {
  //   return session;
  // }

  // let payload: CreateReactionBody;
  // try {
  //   payload = await parseRequestBody(request, createReactionSchema);
  // } catch {
  //   return badRequest("반응 payload가 올바르지 않습니다.");
  // }

  // const supabase = createSupabaseApiClient(request);
  // const { data: existingReaction, error: existingError } = await supabase
  //   .from("reactions")
  //   .select("id")
  //   .eq("user_id", session.userId)
  //   .eq("target_type", payload.targetType)
  //   .eq("target_id", payload.targetId)
  //   .eq("reaction", payload.reaction)
  //   .maybeSingle();

  // if (existingError) {
  //   return internalServerError(existingError.message);
  // }

  // let reacted = true;

  // if (existingReaction) {
  //   const { error: deleteError } = await supabase
  //     .from("reactions")
  //     .delete()
  //     .eq("id", existingReaction.id);

  //   if (deleteError) {
  //     return internalServerError(deleteError.message);
  //   }

  //   reacted = false;
  // } else {
  //   const { error: insertError } = await supabase.from("reactions").insert({
  //     user_id: session.userId,
  //     target_type: payload.targetType,
  //     target_id: payload.targetId,
  //     reaction: payload.reaction,
  //   });

  //   if (insertError) {
  //     return internalServerError(insertError.message);
  //   }
  // }

  // const { count, error: countError } = await supabase
  //   .from("reactions")
  //   .select("id", { count: "exact", head: true })
  //   .eq("target_type", payload.targetType)
  //   .eq("target_id", payload.targetId)
  //   .eq("reaction", payload.reaction);

  // if (countError) {
  //   return internalServerError(countError.message);
  // }

  // const response: CreateReactionResponseData = {
  //   targetType: payload.targetType,
  //   targetId: payload.targetId,
  //   reactionCount: count ?? 0,
  //   reacted,
  // };

  // return ok(response);
}
