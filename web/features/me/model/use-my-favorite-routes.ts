"use client";

import { API_PATHS, type RoutesListResponseData } from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useMyFavoriteRoutes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myFavoriteRoutes,
    queryFn: async () =>
      apiFetch<RoutesListResponseData>(`${API_PATHS.me.favorites}?type=route`),
    enabled,
  });
}
