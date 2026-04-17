"use client";

import {
  API_PATHS,
  type RouteRegion,
  type RoutesListResponseData,
  type RoutesQuery,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export type RouteListFilters = {
  search?: string;
  departureRegion?: RouteRegion;
  destinationRegion?: RouteRegion;
  maxDistanceKm?: number;
  limit?: number;
};

function buildRoutesSearchParams(filters: RouteListFilters) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.departureRegion) {
    searchParams.set("departureRegion", filters.departureRegion);
  }

  if (filters.destinationRegion) {
    searchParams.set("destinationRegion", filters.destinationRegion);
  }

  if (filters.maxDistanceKm !== undefined) {
    searchParams.set("maxDistanceKm", String(filters.maxDistanceKm));
  }

  if (filters.limit !== undefined) {
    searchParams.set("limit", String(filters.limit));
  }

  return searchParams.toString();
}

export function useRoutes(filters: RouteListFilters) {
  const query = buildRoutesSearchParams(filters);
  const paramsForKey: RoutesQuery = {
    search: filters.search,
    departureRegion: filters.departureRegion,
    destinationRegion: filters.destinationRegion,
    maxDistanceKm: filters.maxDistanceKm,
  };

  return useQuery({
    queryKey: queryKeys.routes(paramsForKey),
    queryFn: async () => {
      const endpoint = query
        ? `${API_PATHS.routes.list}?${query}`
        : API_PATHS.routes.list;

      return apiFetch<RoutesListResponseData>(endpoint);
    },
    placeholderData: (previousData) => previousData,
  });
}
