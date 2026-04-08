"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  CreatePostBody,
  CreatePostResponseData,
  DeletePostResponseData,
  UpdatePostBody,
  UpdatePostResponseData,
} from "@package-shared/index";
import { apiFetch, queryKeys } from "@shared/index";

export function useCreateCommunityPost() {
  return useMutation({
    mutationFn: (payload: CreatePostBody) =>
      apiFetch<CreatePostResponseData>(API_PATHS.community.posts, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useUpdateCommunityPost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePostBody) =>
      apiFetch<UpdatePostResponseData>(API_PATHS.community.post(postId), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) }),
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
      ]);
    },
  });
}

export function useDeleteCommunityPost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<DeletePostResponseData>(API_PATHS.community.post(postId), {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.removeQueries({ queryKey: queryKeys.post(postId) }),
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
      ]);
    },
  });
}
