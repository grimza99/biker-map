import { createSupabaseServiceClient } from "@shared/lib/supabase";

export async function incrementPostViewCount(postId: string) {
  const supabase = createSupabaseServiceClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, view_count")
    .eq("id", postId)
    .maybeSingle();

  if (postError) {
    throw new Error(postError.message);
  }

  if (!post) {
    return null;
  }

  const nextViewCount = Number(post.view_count ?? 0) + 1;
  const { error: updateError } = await supabase
    .from("posts")
    .update({
      view_count: nextViewCount,
    })
    .eq("id", postId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return nextViewCount;
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
