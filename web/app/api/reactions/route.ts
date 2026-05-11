import type {
  CreateReactionBody,
  CreateReactionResponseData,
} from "@package-shared/types/reaction";
import {
  badRequest,
  createNotifications,
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
  let reactionTarget:
    | {
        postId: string;
        postAuthorId: string;
        postTitle: string;
        commentAuthorId?: string;
      }
    | null = null;

  if (payload.targetType === "post") {
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, author_id, title")
      .eq("id", payload.targetId)
      .maybeSingle();

    if (postError) {
      return internalServerError(postError.message);
    }

    if (!post) {
      return notFound("반응 대상을 찾을 수 없습니다.");
    }

    reactionTarget = {
      postId: String(post.id),
      postAuthorId: String(post.author_id ?? ""),
      postTitle: String(post.title ?? "게시글"),
    };
  } else {
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, author_id, post_id")
      .eq("id", payload.targetId)
      .maybeSingle();

    if (commentError) {
      return internalServerError(commentError.message);
    }

    if (!comment) {
      return notFound("반응 대상을 찾을 수 없습니다.");
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, author_id, title")
      .eq("id", comment.post_id)
      .maybeSingle();

    if (postError) {
      return internalServerError(postError.message);
    }

    if (!post) {
      return notFound("반응 대상을 찾을 수 없습니다.");
    }

    reactionTarget = {
      postId: String(comment.post_id),
      postAuthorId: String(post.author_id ?? ""),
      postTitle: String(post.title ?? "게시글"),
      commentAuthorId: String(comment.author_id ?? ""),
    };
  }

  const { data: activeReaction, error: toggleError } = await supabase.rpc("toggle_reaction", {
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

  if (activeReaction && reactionTarget) {
    try {
      const notifications: Array<{
        userId: string;
        kind: "reaction";
        sourceType: "post" | "comment";
        sourcePostId: string;
        sourceCommentId?: string;
        title: string;
        message: string;
        url: string;
      }> = [];

      if (
        payload.targetType === "post" &&
        reactionTarget.postAuthorId &&
        reactionTarget.postAuthorId !== session.userId
      ) {
        notifications.push({
          userId: reactionTarget.postAuthorId,
          kind: "reaction",
          sourceType: "post",
          sourcePostId: reactionTarget.postId,
          title: "내 글에 새 반응이 추가되었습니다",
          message: `${session.name}님이 '${reactionTarget.postTitle}' 글에 반응을 남겼습니다.`,
          url: `/posts/${reactionTarget.postId}`,
        });
      }

      if (
        payload.targetType === "comment" &&
        reactionTarget.commentAuthorId &&
        reactionTarget.commentAuthorId !== session.userId
      ) {
        notifications.push({
          userId: reactionTarget.commentAuthorId,
          kind: "reaction",
          sourceType: "comment",
          sourcePostId: reactionTarget.postId,
          sourceCommentId: payload.targetId,
          title: "내 댓글에 새 반응이 추가되었습니다",
          message: `${session.name}님이 회원님의 댓글에 반응을 남겼습니다.`,
          url: `/posts/${reactionTarget.postId}`,
        });
      }

      if (
        payload.targetType === "comment" &&
        reactionTarget.postAuthorId &&
        reactionTarget.postAuthorId !== session.userId &&
        reactionTarget.postAuthorId !== reactionTarget.commentAuthorId
      ) {
        notifications.push({
          userId: reactionTarget.postAuthorId,
          kind: "reaction",
          sourceType: "post",
          sourcePostId: reactionTarget.postId,
          sourceCommentId: payload.targetId,
          title: "내 글에 새 반응이 추가되었습니다",
          message: `${session.name}님이 '${reactionTarget.postTitle}' 글의 댓글에 반응을 남겼습니다.`,
          url: `/posts/${reactionTarget.postId}`,
        });
      }

      await createNotifications(notifications);
    } catch (notificationError) {
      console.error("Failed to create reaction notifications", notificationError);
    }
  }

  return ok<CreateReactionResponseData>({
    targetType: payload.targetType,
    targetId: payload.targetId,
    likeCount: summary.likeCount,
    dislikeCount: summary.dislikeCount,
    myReaction: summary.myReaction,
  });
}
