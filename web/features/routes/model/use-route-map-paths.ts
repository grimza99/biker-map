"use client";

import {
  API_PATHS,
  type RouteMapPathsResponseData,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useRouteMapPaths() {
  return useQuery({
    queryKey: queryKeys.routeMapPaths,
    queryFn: async () =>
      apiFetch<RouteMapPathsResponseData>(API_PATHS.routes.mapPaths),
    staleTime: 1000 * 60 * 5,
  });
}
