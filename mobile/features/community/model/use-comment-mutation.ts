import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  queryKeys,
  type DeleteCommentResponseData,
  type UpdateCommentBody,
  type UpdateCommentResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

function invalidateCommunityQueries(queryClient: ReturnType<typeof useQueryClient>, postId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.postsRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) }),
  ]);
}

export function useUpdateComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommentBody) =>
      apiFetch.patch<UpdateCommentResponseData>(
        API_PATHS.community.comment(commentId),
        payload
      ),
    onSuccess: async () => {
      await invalidateCommunityQueries(queryClient, postId);
    },
  });
}

export function useDeleteComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch.delete<DeleteCommentResponseData>(
        API_PATHS.community.comment(commentId)
      ),
    onSuccess: async () => {
      await invalidateCommunityQueries(queryClient, postId);
    },
  });
}

export function useUpdateCommentReply(postId: string, replyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommentBody) =>
      apiFetch.patch<UpdateCommentResponseData>(
        API_PATHS.community.replyDetail(replyId),
        payload
      ),
    onSuccess: async () => {
      await invalidateCommunityQueries(queryClient, postId);
    },
  });
}

export function useDeleteCommentReply(postId: string, replyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch.delete<DeleteCommentResponseData>(
        API_PATHS.community.replyDetail(replyId)
      ),
    onSuccess: async () => {
      await invalidateCommunityQueries(queryClient, postId);
    },
  });
}
