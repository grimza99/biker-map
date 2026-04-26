import {
  CommentReplyResponseData,
  type CommentReplyBody,
} from "@package-shared/types/community";
import {
  badRequest,
  createSupabaseApiClient,
  created,
  internalServerError,
  notFound,
  parseRequestBody,
  syncCommentReplyCount,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { z } from "zod";

const createReplySchema = z.object({
  content: z.string().min(1),
});

/**-----------------------------create post comment reply -------------------------------- */

export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CommentReplyBody;
  try {
    payload = await parseRequestBody(request, createReplySchema);
  } catch {
    return badRequest("대댓글 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);
  const { data: parentComment, error: parentCommentError } = await supabase
    .from("comments")
    .select("id, post_id")
    .eq("id", commentId)
    .maybeSingle();

  if (parentCommentError) {
    return internalServerError(parentCommentError.message);
  }

  if (!parentComment) {
    return notFound("대댓글을 달 원댓글을 찾을 수 없습니다.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: parentComment.post_id,
      parent_comment_id: commentId,
      author_id: session.userId,
      content: payload.content.trim(),
    })
    .select("id, parent_comment_id, created_at")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  try {
    await syncCommentReplyCount(commentId);
  } catch (countError) {
    return internalServerError(
      countError instanceof Error
        ? countError.message
        : "대댓글 수를 갱신하지 못했습니다."
    );
  }

  return created<CommentReplyResponseData>({
    id: String(data.id),
    parentCommentId: String(data.parent_comment_id),
    createdAt: String(data.created_at),
  });
}
