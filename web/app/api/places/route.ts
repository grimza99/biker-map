import type { PlaceCategory, PlacesQuery } from "@package-shared/types/place";
import {
  createSupabaseApiClient,
  getNumberParam,
  getStringParam,
  getViewportParam,
  internalServerError,
  mapPlaceListItem,
  ok,
  paginateByCursor,
  placeCategories,
} from "@shared/api";
import type { NextRequest } from "next/server";

/**-----------------------------get place list-------------------------------- */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query: PlacesQuery = {
    search: getStringParam(searchParams, "search"),
    category: (() => {
      const category = getStringParam(searchParams, "category");
      return category && placeCategories.has(category as PlaceCategory)
        ? (category as PlaceCategory)
        : undefined;
    })(),
    viewport: getViewportParam(searchParams),
    cursor: getStringParam(searchParams, "cursor"),
    limit: getNumberParam(searchParams, "limit"),
  };

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return internalServerError(error.message);
  }

  const items = (data ?? [])
    .map(mapPlaceListItem)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => {
      if (query.search) {
        const keyword = query.search.toLowerCase();
        if (
          ![item.name, item.address].join(" ").toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      if (query.category && item.category !== query.category) {
        return false;
      }

      if (query.viewport) {
        const { minLng, minLat, maxLng, maxLat } = query.viewport;
        if (
          item.lng < minLng ||
          item.lng > maxLng ||
          item.lat < minLat ||
          item.lat > maxLat
        ) {
          return false;
        }
      }

      return true;
    });

  const { items: pagedItems, meta } = paginateByCursor(
    items,
    query.cursor,
    query.limit
  );

  return ok({ items: pagedItems }, undefined, meta);
}
