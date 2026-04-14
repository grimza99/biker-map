"use client";

import {
  API_PATHS,
  type PostsListResponseData,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useMyPosts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myPosts,
    queryFn: async () => apiFetch<PostsListResponseData>(API_PATHS.me.posts),
    enabled,
  });
}
