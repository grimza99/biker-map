import type { RoutesQuery } from "@package-shared/types/route";
import {
  createSupabaseApiClient,
  getNumberParam,
  getStringParam,
  internalServerError,
  mapRouteListItem,
  ok,
  paginateByCursor,
} from "@shared/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query: RoutesQuery = {
    search: getStringParam(searchParams, "search"),
    region: getStringParam(searchParams, "region"),
    cursor: getStringParam(searchParams, "cursor"),
    limit: getNumberParam(searchParams, "limit"),
  };

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return internalServerError(error.message);
  }

  const items = (data ?? [])
    .map(mapRouteListItem)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => {
      if (query.search) {
        const keyword = query.search.toLowerCase();
        if (
          ![item.title, item.summary].join(" ").toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      if (query.region) {
        const region = query.region.toLowerCase();
        if (!item.region.toLowerCase().includes(region)) {
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
