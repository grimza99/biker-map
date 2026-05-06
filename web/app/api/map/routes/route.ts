import type {
  RouteMapPathItem,
  RouteMapPathsResponseData,
  RoutePathPoint,
} from "@package-shared/types/route";
import {
  createSupabaseApiClient,
  internalServerError,
  mapRouteListItem,
  ok,
} from "@shared/api";

function mapPathPoint(point: unknown): RoutePathPoint | null {
  if (!point || typeof point !== "object") {
    return null;
  }

  const record = point as Record<string, unknown>;
  const lat = Number(record.lat);
  const lng = Number(record.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

export async function GET(request: Request) {
  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("route_paths")
    .select(
      "route_id, path, routes(id, title, departure_region, destination_region, summary, provider, external_map_url, thumbnail_url, distance_km, estimated_duration_minutes, tags, source_type, created_by, departure_lat, departure_lng, destination_lat, destination_lng, directions_calculated_at)"
    )
    .order("calculated_at", { ascending: false });

  if (error) {
    return internalServerError(error.message);
  }

  const items = (data ?? [])
    .map((row): RouteMapPathItem | null => {
      const path = Array.isArray(row.path)
        ? row.path
            .map(mapPathPoint)
            .filter((point): point is RoutePathPoint => Boolean(point))
        : [];

      if (!row.route_id || path.length < 2) {
        return null;
      }

      const route = Array.isArray(row.routes) ? row.routes[0] : row.routes;
      if (!route || typeof route !== "object") {
        return null;
      }

      const mappedRoute = mapRouteListItem(route as Record<string, unknown>);
      if (!mappedRoute) {
        return null;
      }

      return {
        ...mappedRoute,
        routeId: String(row.route_id),
        path,
      };
    })
    .filter((item): item is RouteMapPathItem => Boolean(item));

  return ok<RouteMapPathsResponseData>({ items });
}
