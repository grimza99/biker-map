import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { apiFetch } from "@/shared";
import {
  PostsListResponseData,
  API_PATHS,
  queryKeys,
  RoutesListResponseData,
  ApiResponse,
} from "@package-shared/index";

type FavoriteType = "post" | "route";
type FavoriteResponse<T extends FavoriteType> = T extends "post"
  ? PostsListResponseData
  : RoutesListResponseData;

export function useMyFavorites<T extends FavoriteType>(
  type: T,
  enabled = true
): UseQueryResult<ApiResponse<FavoriteResponse<T>>, Error> {
  return useQuery({
    queryKey: queryKeys.favorites(type, {}),
    queryFn: () =>
      apiFetch<FavoriteResponse<T>>(`${API_PATHS.me.favorites}?type=${type}`),
    enabled,
  });
}
