import {
  API_PATHS,
  buildPostsQuery,
  type CommunityPostsQuery,
  type PostsListResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

export async function getCommunityPostList(query: CommunityPostsQuery = {}) {
  const postQuery = buildPostsQuery(query);
  const endpoint = postQuery
    ? `${API_PATHS.community.posts}?${postQuery}`
    : API_PATHS.community.posts;

  return apiFetch.get<PostsListResponseData>(endpoint);
}
