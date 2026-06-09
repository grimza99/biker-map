import { CommunityPostsQuery } from "src/types/community";

export function buildPostsQuery(filters: CommunityPostsQuery) {
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
