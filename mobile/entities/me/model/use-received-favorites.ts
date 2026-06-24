import { useQuery } from "@tanstack/react-query";

import {
  API_PATHS,
  queryKeys,
  type ReceivedFavoriteCountResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

export function useReceivedFavoriteCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.receivedFavorites,
    queryFn: () =>
      apiFetch<ReceivedFavoriteCountResponseData>(
        API_PATHS.me.receivedFavorites
      ),
    enabled,
  });
}
