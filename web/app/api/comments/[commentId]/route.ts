import type {
  DeleteCommentResponseData,
  UpdateCommentBody,
  UpdateCommentResponseData,
} from "@package-shared/types/community";
import {
  badRequest,
  createSupabaseApiClient,
  forbidden,
  internalServerError,
  notFound,
  ok,
  parseRequestBody,
  syncPostCommentCount,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { z } from "zod";

const updateCommentSchema = z.object({
  content: z.string().min(1),
});

/**-----------------------------edit post comment -------------------------------- */

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: UpdateCommentBody;
  try {
    payload = await parseRequestBody(request, updateCommentSchema);
  } catch {
    return badRequest("댓글 수정 payload가 올바르지 않습니다.");
  }

  const content = payload.content.trim();

  const supabase = createSupabaseApiClient(request);
  const { data: currentComment, error: currentCommentError } = await supabase
    .from("comments")
    .select("id, author_id, post_id, parent_comment_id")
    .eq("id", commentId)
    .maybeSingle();

  if (currentCommentError) {
    return internalServerError(currentCommentError.message);
  }

  if (!currentComment) {
    return notFound("댓글을 찾을 수 없습니다.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError) {
    return internalServerError(profileError.message);
  }

  const isOwner = String(currentComment.author_id ?? "") === session.userId;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return forbidden("댓글을 수정할 권한이 없습니다.");
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ content })
    .eq("id", commentId)
    .select("id, updated_at")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  return ok<UpdateCommentResponseData>({
    id: String(data.id),
    updatedAt: String(data.updated_at),
  });
}
/**-----------------------------remove post comment -------------------------------- */

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data: currentComment, error: currentCommentError } = await supabase
    .from("comments")
    .select("id, author_id, post_id, parent_comment_id")
    .eq("id", commentId)
    .maybeSingle();

  if (currentCommentError) {
    return internalServerError(currentCommentError.message);
  }

  if (!currentComment) {
    return notFound("댓글을 찾을 수 없습니다.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError) {
    return internalServerError(profileError.message);
  }

  const isOwner = String(currentComment.author_id ?? "") === session.userId;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return forbidden("댓글을 삭제할 권한이 없습니다.");
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return internalServerError(error.message);
  }

  if (!currentComment.parent_comment_id) {
    try {
      await syncPostCommentCount(String(currentComment.post_id));
    } catch (countError) {
      return internalServerError(
        countError instanceof Error
          ? countError.message
          : "댓글 수를 갱신하지 못했습니다."
      );
    }
  }

  return ok<DeleteCommentResponseData>({
    id: commentId,
    deleted: true,
  });
}
