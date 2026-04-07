"use client";

import {
  API_PATHS,
  type PostCommentsResponseData,
  type PostDetailResponseData,
} from "@package-shared/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useCommunityPostDetail(postId: string) {
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: async () =>
      apiFetch<PostDetailResponseData>(API_PATHS.community.post(postId)),
    enabled: Boolean(postId),
  });
}

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
