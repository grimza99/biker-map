import { useQuery } from "@tanstack/react-query";
import {
  API_PATHS,
  type RouteListItem,
  type RouteMapPathItem,
  type RouteMapPathsResponseData,
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

/**------------------------------------- route map paths --------------------------------*/

export function useRouteMapPathsQuery() {
  return useQuery<RouteMapPathItem[], Error>({
    queryFn: async () => {
      const res = await apiFetch.get<RouteMapPathsResponseData>(
        API_PATHS.routes.mapPaths
      );

      return res.data.items;
    },
    queryKey: ["routes", "map-paths"],
    staleTime: 1000 * 60 * 5,
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
