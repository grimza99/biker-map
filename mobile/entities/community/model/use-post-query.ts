import {
  API_PATHS,
  type ApiResponse,
  PostCommentsResponseData,
  queryKeys,
  type PostDetailResponseData,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/shared";

export function usePostDetail(postId: string) {
  return useQuery<ApiResponse<PostDetailResponseData>>({
    queryKey: queryKeys.post(postId),
    queryFn: () =>
      apiFetch.get<PostDetailResponseData>(API_PATHS.community.post(postId)),
    enabled: Boolean(postId),
  });
}

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
