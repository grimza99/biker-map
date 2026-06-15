"use client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

import {
  API_PATHS,
  ApiResponse,
  buildFavoritesQuery,
  FavoritesQuery,
  FavoriteTargetType,
  queryKeys,
  RoutesListResponseData,
  type PostsListResponseData,
} from "@package-shared/index";

import { apiFetch } from "@shared/api/http";

type FavoriteResponse<T extends FavoriteTargetType> = T extends "post"
  ? PostsListResponseData
  : RoutesListResponseData;

/**----------------------post, route 를 type으로 받는 favorite list 쿼리------------------------ */
export function useMyFavorites<T extends FavoriteTargetType>(
  querys: FavoritesQuery,
  type: T,
  enabled = true
): UseQueryResult<ApiResponse<FavoriteResponse<T>>, Error> {
  const favoriteQuery = buildFavoritesQuery(querys);
  return useQuery({
    queryKey: queryKeys.favorites(type, querys),
    queryFn: async () =>
      apiFetch<FavoriteResponse<T>>(
        `${API_PATHS.me.favorites}?type=${type}&${favoriteQuery}`
      ),
    enabled,
  });
}
