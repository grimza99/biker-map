"use client";

import { API_PATHS, RouteListItem } from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useRouteDetail(routeId: string) {
  return useQuery({
    queryKey: queryKeys.route(routeId),
    queryFn: async () =>
      apiFetch<RouteListItem>(API_PATHS.routes.detail(routeId)),
    enabled: Boolean(routeId),
  });
}
