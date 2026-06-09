"use client";

import {
  API_PATHS,
  buildRouteQuery,
  type RoutesListResponseData,
  type RoutesQuery,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useRoutes(query: RoutesQuery) {
  const routeQuery = buildRouteQuery(query);
  const paramsForKey: RoutesQuery = {
    search: query.search,
    departureRegion: query.departureRegion,
    destinationRegion: query.destinationRegion,
    maxDistanceKm: query.maxDistanceKm,
  };

  return useQuery({
    queryKey: queryKeys.routes(paramsForKey),
    queryFn: async () => {
      const endpoint = routeQuery
        ? `${API_PATHS.routes.list}?${routeQuery}`
        : API_PATHS.routes.list;

      return apiFetch<RoutesListResponseData>(endpoint);
    },
    placeholderData: (previousData) => previousData,
  });
}
