import { useQuery } from "@tanstack/react-query";

import {
  API_PATHS,
  buildPostsQuery,
  CommunityPostListResponseData,
  CommunityPostsQuery,
  PostCommentsResponseData,
  queryKeys,
  type ApiResponse,
  type PostDetailResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

/**----------------------------------- post list --------------------------------- */

export function usePostList(query: CommunityPostsQuery = {}) {
  const postQuery = buildPostsQuery(query);
  const endpoint = postQuery
    ? `${API_PATHS.community.posts}?${postQuery}`
    : API_PATHS.community.posts;

  return useQuery<ApiResponse<CommunityPostListResponseData>>({
    queryKey: queryKeys.posts(query),
    queryFn: async () => {
      const res = await apiFetch.get<CommunityPostListResponseData>(endpoint);
      return res;
    },
    placeholderData: (previousData) => previousData,
  });
}

/**----------------------------------- post detail --------------------------------- */
export function usePostDetail(postId: string) {
  return useQuery<ApiResponse<PostDetailResponseData>>({
    queryKey: queryKeys.post(postId),
    queryFn: () =>
      apiFetch.get<PostDetailResponseData>(API_PATHS.community.post(postId)),
    enabled: Boolean(postId),
  });
}

/**----------------------------------- post comments --------------------------------- */

export function usePostComments(postId: string) {
  return useQuery<ApiResponse<PostCommentsResponseData>>({
    queryKey: queryKeys.comments(postId),
    queryFn: () =>
      apiFetch.get<PostCommentsResponseData>(
        API_PATHS.community.comments(postId)
      ),
    enabled: Boolean(postId),
  });
}
