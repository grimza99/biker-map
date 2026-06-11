"use client";

import {
  API_PATHS,
  type PlacesListResponseData,
  type PlacesQuery,
  buildPlaceQuery,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

type UsePlacesOptions = {
  enabled?: boolean;
  staleTime?: number;
};

function normalizePlacesFilters(filters: PlacesQuery): PlacesQuery {
  const search = filters.search?.trim();

  return {
    ...(search ? { search } : {}),
    ...(filters.category && filters.category !== "all"
      ? { category: filters.category }
      : {}),
    ...(filters.viewport ? { viewport: filters.viewport } : {}),
    ...(filters.cursor ? { cursor: filters.cursor } : {}),
    ...(filters.limit !== undefined ? { limit: filters.limit } : {}),
  };
}

export function usePlaces(filters: PlacesQuery, options?: UsePlacesOptions) {
  const normalizedFilters = normalizePlacesFilters(filters);
  const query = buildPlaceQuery(normalizedFilters);

  return useQuery({
    queryKey: queryKeys.places(normalizedFilters),
    queryFn: async () => {
      const endpoint = query
        ? `${API_PATHS.places.list}?${query}`
        : API_PATHS.places.list;

      return apiFetch<PlacesListResponseData>(endpoint);
    },
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    placeholderData: (previousData) => previousData,
  });
}
