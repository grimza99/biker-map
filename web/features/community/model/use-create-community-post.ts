"use client";

import { API_PATHS } from "@package-shared/constants/api";
import type {
  CreatePostBody,
  CreatePostResponseData,
} from "@package-shared/types/community";
import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";

export function useCreateCommunityPost() {
  return useMutation({
    mutationFn: (payload: CreatePostBody) =>
      apiFetch<CreatePostResponseData>(API_PATHS.community.posts, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
