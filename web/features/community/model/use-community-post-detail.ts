"use client";

import { API_PATHS, type PostDetailResponseData } from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { useSession } from "@features/session/model/use-session";
import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useCommunityPostDetail(postId: string) {
  const { accessToken, status } = useSession();

  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: async () =>
      apiFetch<PostDetailResponseData>(API_PATHS.community.post(postId), {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      }),
    enabled: Boolean(postId) && status !== "loading",
  });
}
