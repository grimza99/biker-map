"use client";

import {
  API_PATHS,
  type PlaceCategory,
  type PlacesListResponseData,
  type PlaceViewport,
  type PlacesQuery,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

type UsePlacesOptions = {
  enabled?: boolean;
  staleTime?: number;
};

function serializeViewport(viewport?: PlaceViewport) {
  if (!viewport) {
    return null;
  }

  return [
    viewport.minLng,
    viewport.minLat,
    viewport.maxLng,
    viewport.maxLat,
  ].join(",");
}

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

function buildPlacesSearchParams(filters: PlacesQuery) {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  if (filters.category) {
    searchParams.set("category", filters.category as PlaceCategory);
  }

  const serializedViewport = serializeViewport(filters.viewport);
  if (serializedViewport) {
    searchParams.set("viewport", serializedViewport);
  }

  if (filters.cursor) {
    searchParams.set("cursor", filters.cursor);
  }

  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }

  return searchParams.toString();
}

export function usePlaces(filters: PlacesQuery, options?: UsePlacesOptions) {
  const normalizedFilters = normalizePlacesFilters(filters);
  const query = buildPlacesSearchParams(normalizedFilters);

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
