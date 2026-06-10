import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/shared";
import {
  PostsListResponseData,
  API_PATHS,
  queryKeys,
} from "@package-shared/index";

export function useMyFavoritePosts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myFavoritePosts,
    queryFn: async () =>
      apiFetch<PostsListResponseData>(`${API_PATHS.me.favorites}?type=post`),
    enabled,
  });
}
