"use client";

import {
  API_PATHS,
  type CommunityPostsQuery,
  type PostsListResponseData,
} from "@package-shared/index";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

function buildPostsSearchParams(filters: CommunityPostsQuery) {
  const searchParams = new URLSearchParams();

  if (filters.category) {
    searchParams.set("category", filters.category);
  }

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  searchParams.set("page", String(filters.page));
  searchParams.set("pageSize", String(filters.pageSize));
  searchParams.set("sort", String(filters.sort));

  return searchParams.toString();
}

export function useCommunityPosts(filters: CommunityPostsQuery) {
  const query = buildPostsSearchParams(filters);
  return useQuery({
    queryKey: queryKeys.posts(filters),
    queryFn: async () => {
      const data = await apiFetch<PostsListResponseData>(
        `${API_PATHS}?${query}`
      );
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}
