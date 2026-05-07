import type {
  CreatePostCommentBody,
  PostCommentsResponseData,
} from "@package-shared/types/community";
import type { ReactionSummary } from "@package-shared/types/reaction";
import {
  badRequest,
  createSupabaseApiClient,
  created,
  internalServerError,
  loadProfileNameMap,
  loadReactionSummaryMap,
  ok,
  parseRequestBody,
  syncPostCommentCountBestEffort,
} from "@shared/api";
import { formatRelativeLabel } from "@shared/lib";
import { getSupabaseAuthSession, requireApiSession } from "@shared/api/auth";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1),
});

/**-----------------------------get post comments -------------------------------- */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = createSupabaseApiClient(request);
  const authSession = await getSupabaseAuthSession(request);
  const viewerUserId = authSession?.user.id ?? null;

  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, author_id, parent_comment_id, content, reply_count, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return internalServerError(error.message);
  }

  const rows = data ?? [];
  let reactionMap = new Map<string, ReactionSummary>();
  let authorMap: Map<string, string>;
  try {
    authorMap = await loadProfileNameMap(
      supabase,
      rows.map((row) => String(row.author_id ?? ""))
    );
  } catch (profileError) {
    return internalServerError(
      profileError instanceof Error
        ? profileError.message
        : "댓글 작성자 정보를 불러오지 못했습니다."
    );
  }

  try {
    reactionMap = await loadReactionSummaryMap(
      "comment",
      rows.map((row) => String(row.id ?? "")),
      viewerUserId
    );
  } catch (reactionError) {
    return internalServerError(
      reactionError instanceof Error
        ? reactionError.message
        : "댓글 반응 정보를 불러오지 못했습니다."
    );
  }

  const parentComments = rows.filter((row) => !row.parent_comment_id);
  const replies = rows.filter((row) => Boolean(row.parent_comment_id));

  const items: PostCommentsResponseData["items"] = parentComments.map((row) => ({
    id: String(row.id),
    postId: String(row.post_id),
    author: {
      id: String(row.author_id),
      name: authorMap.get(String(row.author_id ?? "")) ?? "익명",
    },
    content: String(row.content ?? ""),
    timeLabel: formatRelativeLabel(String(row.created_at ?? new Date().toISOString())),
    replyCount: Number(row.reply_count ?? 0),
    reactions: reactionMap.get(String(row.id ?? "")) ?? {
      likeCount: 0,
      dislikeCount: 0,
      myReaction: null,
    },
    replies: replies
      .filter((reply) => String(reply.parent_comment_id) === String(row.id))
      .map((reply) => ({
        id: String(reply.id),
        parentCommentId: String(reply.parent_comment_id),
        author: {
          id: String(reply.author_id),
          name: authorMap.get(String(reply.author_id ?? "")) ?? "익명",
        },
        content: String(reply.content ?? ""),
        timeLabel: formatRelativeLabel(
          String(reply.created_at ?? new Date().toISOString())
        ),
        reactions: reactionMap.get(String(reply.id ?? "")) ?? {
          likeCount: 0,
          dislikeCount: 0,
          myReaction: null,
        },
      })),
  }));

  return ok({ items });
}

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

  await syncPostCommentCountBestEffort(postId);

  return created({
    id: String(data.id),
    postId: String(data.post_id),
    createdAt: String(data.created_at),
  });
}
