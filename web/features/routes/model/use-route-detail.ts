"use client";

import { API_PATHS, RouteDetail } from "@package-shared/index";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useSession } from "@features/session/model/use-session";
import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useRouteDetail(routeId: string) {
  const { accessToken, status } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!routeId || status === "loading") {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: queryKeys.route(routeId),
    });
  }, [accessToken, queryClient, routeId, status]);

  return useQuery({
    queryKey: queryKeys.route(routeId),
    queryFn: async () =>
      apiFetch<RouteDetail>(API_PATHS.routes.detail(routeId), {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      }),
    enabled: Boolean(routeId) && status !== "loading",
  });
}
