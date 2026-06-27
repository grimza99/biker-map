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

type UseRoutesOptions = {
  enabled?: boolean;
};

export function useRoutes(query: RoutesQuery, options?: UseRoutesOptions) {
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
    enabled: options?.enabled,
    placeholderData: (previousData) => previousData,
  });
}
