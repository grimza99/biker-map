import {
  CommentReplyResponseData,
  type CommentReplyBody,
} from "@package-shared/types/community";
import {
  badRequest,
  createNotifications,
  createSupabaseApiClient,
  created,
  internalServerError,
  notFound,
  parseRequestBody,
  syncCommentReplyCountBestEffort,
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
    .select("id, post_id, author_id, content")
    .eq("id", commentId)
    .maybeSingle();

  if (parentCommentError) {
    return internalServerError(parentCommentError.message);
  }

  if (!parentComment) {
    return notFound("대댓글을 달 원댓글을 찾을 수 없습니다.");
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, author_id, title")
    .eq("id", parentComment.post_id)
    .maybeSingle();

  if (postError) {
    return internalServerError(postError.message);
  }

  if (!post) {
    return notFound("게시글을 찾을 수 없습니다.");
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

  await syncCommentReplyCountBestEffort(commentId);

  try {
    await createNotifications([
      String(parentComment.author_id ?? "") !== session.userId
        ? {
            userId: String(parentComment.author_id),
            kind: "reply" as const,
            sourceType: "comment" as const,
            sourcePostId: String(parentComment.post_id),
            sourceCommentId: commentId,
            title: "내 댓글에 새 답글이 달렸습니다",
            message: `${session.name}님이 회원님의 댓글에 답글을 남겼습니다.`,
            url: `/posts/${parentComment.post_id}`,
          }
        : undefined,
      String(post.author_id ?? "") !== session.userId &&
      String(post.author_id ?? "") !== String(parentComment.author_id ?? "")
        ? {
            userId: String(post.author_id),
            kind: "reply" as const,
            sourceType: "post" as const,
            sourcePostId: String(parentComment.post_id),
            sourceCommentId: commentId,
            title: "내 글에 새 답글이 달렸습니다",
            message: `${session.name}님이 '${String(post.title ?? "게시글")}' 글의 댓글에 답글을 남겼습니다.`,
            url: `/posts/${parentComment.post_id}`,
          }
        : undefined,
    ].filter(Boolean) as Array<Parameters<typeof createNotifications>[0][number]>);
  } catch (notificationError) {
    console.error("Failed to create reply notifications", notificationError);
  }

  return created<CommentReplyResponseData>({
    id: String(data.id),
    parentCommentId: String(data.parent_comment_id),
    createdAt: String(data.created_at),
  });
}
