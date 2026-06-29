import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  queryKeys,
  type CommentReplyResponseData,
  type CreatePostCommentResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

/**----------------------------------------------------------------------- */
export function useCreatePostComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) =>
      apiFetch.post<CreatePostCommentResponseData>(
        API_PATHS.community.comments(postId),
        {
          content,
        }
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.postsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) }),
      ]);
    },
  });
}

/**----------------------------------------------------------------------- */
export function useCreateCommentReply(postId: string, commentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!commentId) {
        throw new Error("답글을 작성할 댓글 ID가 필요합니다.");
      }

      return apiFetch.post<CommentReplyResponseData>(
        API_PATHS.community.reply(commentId),
        {
          content,
        }
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.postsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) }),
      ]);
    },
  });
}
