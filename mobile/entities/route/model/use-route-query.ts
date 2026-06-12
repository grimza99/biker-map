import {
  API_PATHS,
  buildRouteQuery,
  queryKeys,
  RouteDetail,
  type ApiResponse,
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
  return useQuery<ApiResponse<RoutesListResponseData>, Error>({
    placeholderData: (previousData) => previousData,
    queryFn: async () => getRouteList(query),
    queryKey: queryKeys.routes(query),
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

async function getRouteList(query: RoutesQuery) {
  const routeQuery = buildRouteQuery(query);

  return apiFetch.get<RoutesListResponseData>(
    routeQuery
      ? `${API_PATHS.routes.list}?${routeQuery}`
      : API_PATHS.routes.list
  );
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
