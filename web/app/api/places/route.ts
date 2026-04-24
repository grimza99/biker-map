import type {
  CreatePlaceBody,
  PlaceCategory,
  PlacesQuery,
} from "@package-shared/types/place";
import {
  badRequest,
  createSupabaseApiClient,
  created,
  forbidden,
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
import { z } from "zod";
import { requireApiSession } from "@shared/api/auth";

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

/**-----------------------------create place-------------------------------- */

const createPlaceSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["gas", "repair", "cafe", "shop", "rest"]),
  address: z.string().min(1),
  phone: z.string().optional(),
  description: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  images: z.array(z.string()).optional(),
  naverPlaceUrl: z.string().url(),
});
export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CreatePlaceBody;
  try {
    payload = await request.json();
    payload = createPlaceSchema.parse(payload);
  } catch {
    return badRequest("장소 생성 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError) {
    return internalServerError(profileError.message);
  }

  if (profile?.role !== "admin") {
    return forbidden("장소 생성은 운영자만 가능합니다.");
  }

  const { data, error } = await supabase
    .from("places")
    .insert({
      name: payload.name.trim(),
      category: payload.category,
      address: payload.address.trim(),
      phone: payload.phone?.trim() || null,
      description: payload.description?.trim() || null,
      lat: payload.lat,
      lng: payload.lng,
      images: payload.images ?? [],
      naver_place_url: payload.naverPlaceUrl,
    })
    .select("id, created_at")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  return created({
    id: String(data.id),
    createdAt: String(data.created_at),
  });
}
