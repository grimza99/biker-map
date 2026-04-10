"use client";

import { API_PATHS, type MeResponseData } from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => apiFetch<MeResponseData>(API_PATHS.auth.me),
    enabled,
  });
}
