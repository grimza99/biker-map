import type {
  CommentReplyBody,
  DeleteCommentResponseData,
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
  syncCommentReplyCountBestEffort,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { z } from "zod";

const updateReplySchema = z.object({
  content: z.string().min(1),
});

/**-----------------------------edit post comment reply -------------------------------- */

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ replyId: string }> }
) {
  const { replyId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CommentReplyBody;
  try {
    payload = await parseRequestBody(request, updateReplySchema);
  } catch {
    return badRequest("대댓글 수정 payload가 올바르지 않습니다.");
  }

  const content = payload.content.trim();

  const supabase = createSupabaseApiClient(request);
  const { data: currentReply, error: currentReplyError } = await supabase
    .from("comments")
    .select("id, author_id, parent_comment_id")
    .eq("id", replyId)
    .maybeSingle();

  if (currentReplyError) {
    return internalServerError(currentReplyError.message);
  }

  if (!currentReply || !currentReply.parent_comment_id) {
    return notFound("대댓글을 찾을 수 없습니다.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError) {
    return internalServerError(profileError.message);
  }

  const isOwner = String(currentReply.author_id ?? "") === session.userId;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return forbidden("대댓글을 수정할 권한이 없습니다.");
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ content })
    .eq("id", replyId)
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

/**-----------------------------remove post comment reply -------------------------------- */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ replyId: string }> }
) {
  const { replyId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data: currentReply, error: currentReplyError } = await supabase
    .from("comments")
    .select("id, author_id, parent_comment_id")
    .eq("id", replyId)
    .maybeSingle();

  if (currentReplyError) {
    return internalServerError(currentReplyError.message);
  }

  if (!currentReply || !currentReply.parent_comment_id) {
    return notFound("대댓글을 찾을 수 없습니다.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError) {
    return internalServerError(profileError.message);
  }

  const isOwner = String(currentReply.author_id ?? "") === session.userId;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return forbidden("대댓글을 삭제할 권한이 없습니다.");
  }

  const { error } = await supabase.from("comments").delete().eq("id", replyId);

  if (error) {
    return internalServerError(error.message);
  }

  await syncCommentReplyCountBestEffort(String(currentReply.parent_comment_id));

  return ok<DeleteCommentResponseData>({
    id: replyId,
    deleted: true,
  });
}
