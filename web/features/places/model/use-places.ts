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

function buildPlacesSearchParams(filters: PlacesQuery) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
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

export function usePlaces(filters: PlacesQuery) {
  const query = buildPlacesSearchParams(filters);

  return useQuery({
    queryKey: queryKeys.places(filters),
    queryFn: async () => {
      const endpoint = query
        ? `${API_PATHS.places.list}?${query}`
        : API_PATHS.places.list;

      return apiFetch<PlacesListResponseData>(endpoint);
    },
    placeholderData: (previousData) => previousData,
  });
}
