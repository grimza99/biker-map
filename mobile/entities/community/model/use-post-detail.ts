import {
  API_PATHS,
  CommunityPostDetail,
  queryKeys,
  type PostDetailResponseData,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/shared";

export function useCommunityPostDetail(postId: string) {
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
