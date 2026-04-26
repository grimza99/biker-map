import { createSupabaseServiceClient } from "@shared/lib/supabase";

export async function incrementPostViewCount(postId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("increment_post_view_count", {
    target_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (typeof data !== "number") {
    return null;
  }

  return data;
}

export async function syncPostCommentCount(postId: string) {
  const supabase = createSupabaseServiceClient();

  const { count, error: countError } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId)
    .is("parent_comment_id", null);

  if (countError) {
    throw new Error(countError.message);
  }

  const nextCommentCount = count ?? 0;
  const { error: updateError } = await supabase
    .from("posts")
    .update({
      comment_count: nextCommentCount,
    })
    .eq("id", postId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return nextCommentCount;
}

export async function syncPostCommentCountBestEffort(postId: string) {
  try {
    return await syncPostCommentCount(postId);
  } catch (error) {
    console.error("Failed to sync post comment count", error);
    return null;
  }
}

export async function syncCommentReplyCount(commentId: string) {
  const supabase = createSupabaseServiceClient();

  const { count, error: countError } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("parent_comment_id", commentId);

  if (countError) {
    throw new Error(countError.message);
  }

  const nextReplyCount = count ?? 0;
  const { error: updateError } = await supabase
    .from("comments")
    .update({
      reply_count: nextReplyCount,
    })
    .eq("id", commentId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return nextReplyCount;
}

export async function syncCommentReplyCountBestEffort(commentId: string) {
  try {
    return await syncCommentReplyCount(commentId);
  } catch (error) {
    console.error("Failed to sync comment reply count", error);
    return null;
  }
}
