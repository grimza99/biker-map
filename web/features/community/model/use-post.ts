"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  API_PATHS,
  CreatePostBody,
  CreatePostResponseData,
  DeletePostResponseData,
  TOAST_MESSAGE,
  UpdatePostBody,
  UpdatePostResponseData,
} from "@package-shared/index";
import { apiFetch, queryKeys, useToast } from "@shared/index";

export function useCreateCommunityPost() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (payload: CreatePostBody) =>
      apiFetch<CreatePostResponseData>(API_PATHS.community.posts, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
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

export function useUpdateCommunityPost(postId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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

export function useDeleteCommunityPost(postId?: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (targetPostId?: string) =>
      apiFetch<DeletePostResponseData>(
        API_PATHS.community.post(targetPostId ?? postId ?? ""),
        {
          method: "DELETE",
        }
      ),
    onSuccess: async (_, targetPostId) => {
      const resolvedPostId = targetPostId ?? postId;

      if (resolvedPostId) {
        await queryClient.removeQueries({
          queryKey: queryKeys.post(resolvedPostId),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["posts"] });
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
