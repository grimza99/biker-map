import { apiFetch, queryKeys } from "@/shared";
import {
  API_PATHS,
  DeleteCommentResponseData,
  PostCommentsResponseData,
  UpdateCommentBody,
  UpdateCommentResponseData,
} from "@package-shared/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCommunityPostComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: async () =>
      apiFetch<PostCommentsResponseData>(API_PATHS.community.comments(postId)),
    enabled: Boolean(postId),
  });
}

export function useCreatePostComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) =>
      apiFetch(API_PATHS.community.comments(postId), {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.post(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts(),
      });
    },
  });
}

export function useUpdatePostComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommentBody) =>
      apiFetch<UpdateCommentResponseData>(`/api/comments/${commentId}`, {
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

export function useDeletePostComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<DeleteCommentResponseData>(`/api/comments/${commentId}`, {
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
