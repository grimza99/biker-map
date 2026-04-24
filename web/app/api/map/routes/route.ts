import type {
  RouteMapPathItem,
  RouteMapPathsResponseData,
  RoutePathPoint,
} from "@package-shared/types/route";
import { createSupabaseApiClient, internalServerError, ok } from "@shared/api";

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
    .select("route_id, path, routes(title)")
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

      return {
        routeId: String(row.route_id),
        title:
          route && typeof route === "object" && "title" in route
            ? String(route.title ?? "추천 경로")
            : "추천 경로",
        path,
      };
    })
    .filter((item): item is RouteMapPathItem => Boolean(item));

  return ok<RouteMapPathsResponseData>({ items });
}
