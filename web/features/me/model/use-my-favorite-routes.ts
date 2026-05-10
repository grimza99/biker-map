"use client";

import { API_PATHS, type RoutesListResponseData } from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";

export function useMyFavoriteRoutes(enabled = true) {
  return useQuery({
    queryKey: ["me", "favorites", "route"] as const,
    queryFn: async () =>
      apiFetch<RoutesListResponseData>(`${API_PATHS.me.favorites}?type=route`),
    enabled,
  });
}
