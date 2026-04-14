"use client";

import {
  API_PATHS,
  type PostsListResponseData,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export type MyPostsQuery = {
  page: number;
  pageSize: number;
};

function buildMyPostsSearchParams({ page, pageSize }: MyPostsQuery) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("pageSize", String(pageSize));
  return searchParams.toString();
}

export function useMyPosts(filters: MyPostsQuery, enabled = true) {
  const query = buildMyPostsSearchParams(filters);

  return useQuery({
    queryKey: queryKeys.myPosts(filters),
    queryFn: async () =>
      apiFetch<PostsListResponseData>(
        `${API_PATHS.me.posts}?${query}`
      ),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}
