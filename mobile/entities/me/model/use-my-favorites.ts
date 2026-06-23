import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  PostsListResponseData,
  API_PATHS,
  queryKeys,
  RoutesListResponseData,
  ApiResponse,
  FavoriteTargetType,
  FavoritesQuery,
  buildFavoritesQuery,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

type FavoriteResponse<T extends FavoriteTargetType> = T extends "post"
  ? PostsListResponseData
  : RoutesListResponseData;

export function useMyFavorites<T extends FavoriteTargetType>(
  querys: FavoritesQuery,
  type: T,
  enabled = true
): UseQueryResult<ApiResponse<FavoriteResponse<T>>, Error> {
  const favoriteQuery = buildFavoritesQuery(querys);

  return useQuery({
    queryKey: queryKeys.favorites(type, querys),
    queryFn: () =>
      apiFetch<FavoriteResponse<T>>(
        `${API_PATHS.me.favorites}?type=${type}&${favoriteQuery}`
      ),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}
