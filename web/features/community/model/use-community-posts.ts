"use client";
import { useQuery } from "@tanstack/react-query";

import {
  API_PATHS,
  buildPostsQuery,
  type CommunityPostsQuery,
  type PostsListResponseData,
} from "@package-shared/index";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useCommunityPosts(query: CommunityPostsQuery) {
  const postsQuery = buildPostsQuery(query);
  return useQuery({
    queryKey: queryKeys.posts(query),
    queryFn: async () => {
      const endpoint = postsQuery
        ? `${API_PATHS.community.posts}?${postsQuery}`
        : API_PATHS.community.posts;
      const data = await apiFetch<PostsListResponseData>(endpoint);
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}
