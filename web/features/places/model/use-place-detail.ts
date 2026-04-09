"use client";

import { API_PATHS, type PlaceDetail } from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function usePlaceDetail(placeId: string) {
  return useQuery({
    queryKey: queryKeys.place(placeId),
    queryFn: async () => apiFetch<PlaceDetail>(API_PATHS.places.detail(placeId)),
    enabled: Boolean(placeId),
  });
}
