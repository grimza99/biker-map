"use client";

import {
  API_PATHS,
  type ApiResponse,
  type CreateFavoriteResponseData,
  type DeleteFavoriteResponseData,
  type FavoriteTargetType,
  type PostDetailResponseData,
  type RouteDetail,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

type ToggleFavoriteState = {
  favorited?: boolean;
  favoriteId?: string;
};

type ToggleFavoriteParams = {
  targetType: FavoriteTargetType;
  targetId: string;
};

type FavoriteDetailData = ApiResponse<PostDetailResponseData> | ApiResponse<RouteDetail>;

type FavoriteMutationContext = {
  previousDetail?: FavoriteDetailData;
};

function getOptimisticFavoriteState(state: ToggleFavoriteState) {
  if (state.favorited && state.favoriteId) {
    return {
      favorited: false,
      favoriteId: undefined,
    };
  }

  return {
    favorited: true,
    favoriteId: "optimistic-favorite",
  };
}

function updateFavoriteDetail(
  current: FavoriteDetailData | undefined,
  nextState: { favorited: boolean; favoriteId?: string },
  targetId: string
) {
  if (!current || current.data.id !== targetId) {
    return current;
  }

  return {
    ...current,
    data: {
      ...current.data,
      favorited: nextState.favorited,
      favoriteId: nextState.favoriteId,
    },
  };
}

export function useToggleFavorite({
  targetType,
  targetId,
}: ToggleFavoriteParams) {
  const queryClient = useQueryClient();
  const detailQueryKey =
    targetType === "post" ? queryKeys.post(targetId) : queryKeys.route(targetId);

  return useMutation({
    mutationFn: async (state: ToggleFavoriteState) => {
      if (state.favorited && state.favoriteId) {
        await apiFetch<DeleteFavoriteResponseData>(
          API_PATHS.favorites.detail(state.favoriteId),
          {
            method: "DELETE",
          }
        );

        return {
          favoriteId: undefined,
          favorited: false,
        };
      }

      const response = await apiFetch<CreateFavoriteResponseData>(
        API_PATHS.favorites.list,
        {
          method: "POST",
          body: JSON.stringify({
            targetType,
            targetId,
          }),
        }
      );

      return {
        favoriteId: response.data.id,
        favorited: true,
      };
    },
    onMutate: async (state): Promise<FavoriteMutationContext> => {
      await queryClient.cancelQueries({ queryKey: detailQueryKey });
      const previousDetail =
        queryClient.getQueryData<FavoriteDetailData>(detailQueryKey);

      queryClient.setQueryData<FavoriteDetailData>(
        detailQueryKey,
        (current) =>
          updateFavoriteDetail(
            current,
            getOptimisticFavoriteState(state),
            targetId
          ) as FavoriteDetailData | undefined
      );

      return {
        previousDetail,
      };
    },
    onError: (_error, _state, context) => {
      queryClient.setQueryData(detailQueryKey, context?.previousDetail);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<FavoriteDetailData>(
        detailQueryKey,
        (current) =>
          updateFavoriteDetail(current, result, targetId) as
            | FavoriteDetailData
            | undefined
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: detailQueryKey }),
        queryClient.invalidateQueries({ queryKey: queryKeys.favorites }),
        queryClient.invalidateQueries({ queryKey: queryKeys.meFavoritesRoot }),
      ]);
    },
  });
}
