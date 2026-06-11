import {
  API_PATHS,
  buildRouteQuery,
  queryKeys,
  type RouteListItem,
  type RouteMapPathItem,
  type RouteMapPathsResponseData,
  type RoutesListResponseData,
  type RoutesQuery,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

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

export function useRouteMapPathsQuery() {
  return useQuery<RouteMapPathItem[], Error>({
    queryFn: async () => {
      const res = await apiFetch.get<RouteMapPathsResponseData>(
        API_PATHS.routes.mapPaths
      );

      return res.data.items;
    },
    queryKey: queryKeys.routeMapPaths,
    staleTime: 1000 * 60 * 5,
  });
}
