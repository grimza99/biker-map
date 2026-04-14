"use client";

import {
  API_PATHS,
  type RoutesListResponseData,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useMyRoutes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myRoutes(),
    queryFn: async () => apiFetch<RoutesListResponseData>(API_PATHS.me.routes),
    enabled,
  });
}
