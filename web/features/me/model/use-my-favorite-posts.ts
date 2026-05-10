"use client";

import { API_PATHS, type PostsListResponseData } from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useMyFavoritePosts(enabled = true) {
  return useQuery({
    queryKey: ["me", "favorites", "post"] as const,
    queryFn: async () =>
      apiFetch<PostsListResponseData>(`${API_PATHS.me.favorites}?type=post`),
    enabled,
  });
}
