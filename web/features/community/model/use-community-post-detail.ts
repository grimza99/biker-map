"use client";

import { API_PATHS, type PostDetailResponseData } from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

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
