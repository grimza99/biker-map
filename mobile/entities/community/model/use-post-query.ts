import {
  API_PATHS,
  PostCommentsResponseData,
  queryKeys,
  type PostDetailResponseData,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/shared";

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: async () => {
      const res = await apiFetch.get<PostDetailResponseData>(
        API_PATHS.community.post(postId)
      );
      return res.data;
    },
    enabled: Boolean(postId),
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: async () =>
      apiFetch.get<PostCommentsResponseData>(
        API_PATHS.community.comments(postId)
      ),
    enabled: Boolean(postId),
  });
}
