import { apiFetch, queryKeys, useToast } from "@/shared";
import {
  API_PATHS,
  DeleteCommentResponseData,
  PostCommentsResponseData,
  TOAST_MESSAGE,
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
  const { showToast } = useToast();

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
      showToast({
        tone: "success",
        title: TOAST_MESSAGE.POST.C,
      });
    },
    onError: () => {
      showToast({
        tone: "danger",
        title: TOAST_MESSAGE.POST.E,
      });
    },
  });
}

export function useUpdatePostComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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
      showToast({
        tone: "success",
        title: TOAST_MESSAGE.POST.U,
      });
    },
    onError: () => {
      showToast({
        tone: "danger",
        title: TOAST_MESSAGE.POST.E,
      });
    },
  });
}

export function useDeletePostComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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
      showToast({
        tone: "success",
        title: TOAST_MESSAGE.POST.D,
      });
    },
    onError: () => {
      showToast({
        tone: "danger",
        title: TOAST_MESSAGE.POST.E,
      });
    },
  });
}
