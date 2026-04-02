import type { CreatePostCommentBody } from "@package-shared/types/community";
import {
  badRequest,
  createSupabaseApiClient,
  created,
  internalServerError,
  parseRequestBody,
  requireApiSession,
} from "@shared/api";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1),
});

/**-----------------------------create post comment -------------------------------- */

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CreatePostCommentBody;
  try {
    payload = await parseRequestBody(request, createCommentSchema);
  } catch {
    return badRequest("댓글 payload가 올바르지 않습니다.");
  }

  if (!payload.content.trim()) {
    return badRequest("댓글 내용을 입력해주세요.");
  }

  const supabase = createSupabaseApiClient(request);

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: session.userId,
      content: payload.content.trim(),
    })
    .select("id, post_id, created_at")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  return created({
    id: String(data.id),
    postId: String(data.post_id),
    createdAt: String(data.created_at),
  });
}
