import { apiFetch, queryKeys } from "@/shared";
import {
  API_PATHS,
  DeleteCommentResponseData,
  UpdateCommentBody,
  UpdateCommentResponseData,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCommentReply(postId: string, commentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!commentId) throw new Error("댓글 ID가 필요합니다.");
      return apiFetch(API_PATHS.community.reply(commentId), {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: async () => {
      if (!commentId) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.post(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts(),
      });
    },
  });
}

export function useUpdateCommentReply(postId: string, replyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommentBody) =>
      apiFetch<UpdateCommentResponseData>(`/api/reply/${replyId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments(postId),
      });
    },
  });
}

export function useDeleteCommentReply(postId: string, replyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<DeleteCommentResponseData>(`/api/reply/${replyId}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments(postId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.post(postId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.posts(),
        }),
      ]);
    },
  });
}
