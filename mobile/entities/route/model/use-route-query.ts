import { useQuery } from "@tanstack/react-query";
import {
  API_PATHS,
  queryKeys,
  RouteDetail,
  type ApiResponse,
  type RouteListItem,
  type RoutesListResponseData,
  type RoutesQuery,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

/**------------------------------------- route list --------------------------------*/

export function useRouteListQuery(query: RoutesQuery) {
  return useQuery<RouteListItem[], Error>({
    queryFn: async () => {
      const routeQuery = buildRouteQuery(query);

      const res = await apiFetch.get<RoutesListResponseData>(
        routeQuery
          ? `${API_PATHS.routes.list}?${routeQuery}`
          : API_PATHS.routes.list
      );
      return res.data.items;
    },
    queryKey: [
      "routes",
      "list",
      {
        cursor: query.cursor,
        departureRegion: query.departureRegion,
        destinationRegion: query.destinationRegion,
        limit: query.limit,
        maxDistanceKm: query.maxDistanceKm,
        search: query.search,
      },
    ],
  });
}
export function buildRouteQuery(query: RoutesQuery) {
  const searchParams = new URLSearchParams();

  if (query.search?.trim()) {
    searchParams.set("search", query.search.trim());
  }

  if (query.departureRegion) {
    searchParams.set("departureRegion", query.departureRegion);
  }

  if (query.destinationRegion) {
    searchParams.set("destinationRegion", query.destinationRegion);
  }

  if (query.maxDistanceKm !== undefined) {
    searchParams.set("maxDistanceKm", String(query.maxDistanceKm));
  }

  if (query.cursor) {
    searchParams.set("cursor", query.cursor);
  }

  if (query.limit) {
    searchParams.set("limit", String(query.limit));
  }

  return searchParams.toString();
}

/**------------------------------------- route-detail --------------------------------*/
export function useRouteDetailQuery(routeId: string) {
  return useQuery<ApiResponse<RouteDetail>, Error>({
    queryKey: queryKeys.route(routeId),
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      return apiFetch.get<RouteDetail>(API_PATHS.routes.detail(routeId));
    },
  });
}
