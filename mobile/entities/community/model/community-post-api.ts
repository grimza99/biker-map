import { apiFetch } from "@/shared";
import { API_PATHS } from "@package-shared/constants";
import {
  type CommunityPostsQuery,
  type PostsListResponseData,
} from "@package-shared/index";

export async function getCommunityPostList(filters: CommunityPostsQuery = {}) {
  const query = buildPostsSearchParams(filters);

  return apiFetch.get<PostsListResponseData>(
    query ? `${API_PATHS.community.posts}?${query}` : API_PATHS.community.posts
  );
}

function buildPostsSearchParams(filters: CommunityPostsQuery) {
  const searchParams = new URLSearchParams();

  if (filters.category) {
    searchParams.set("category", filters.category);
  }

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.page) {
    searchParams.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    searchParams.set("pageSize", String(filters.pageSize));
  }

  if (filters.sort) {
    searchParams.set("sort", filters.sort);
  }

  return searchParams.toString();
}
