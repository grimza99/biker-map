import {
  API_PATHS,
  type ApiResponse,
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

export function useRouteListResponseQuery(query: RoutesQuery) {
  return useQuery<ApiResponse<RoutesListResponseData>, Error>({
    placeholderData: (previousData) => previousData,
    queryFn: async () => getRouteList(query),
    queryKey: buildRouteQueryKey(query),
  });
}

export function useRouteListQuery(query: RoutesQuery) {
  return useQuery<RouteListItem[], Error>({
    queryFn: async () => {
      const res = await getRouteList(query);
      return res.data.items;
    },
    queryKey: buildRouteQueryKey(query),
  });
}

async function getRouteList(query: RoutesQuery) {
  const routeQuery = buildRouteQuery(query);

  return apiFetch.get<RoutesListResponseData>(
    routeQuery
      ? `${API_PATHS.routes.list}?${routeQuery}`
      : API_PATHS.routes.list
  );
}

function buildRouteQueryKey(query: RoutesQuery) {
  return [
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
  ];
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
