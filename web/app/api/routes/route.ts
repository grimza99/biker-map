import type { CreateRouteBody, RoutesQuery } from "@package-shared/types/route";
import {
  badRequest,
  createSupabaseApiClient,
  created,
  forbidden,
  getNumberParam,
  getStringParam,
  internalServerError,
  mapRouteListItem,
  ok,
  paginateByCursor,
  requireApiSession,
} from "@shared/api";
import type { NextRequest } from "next/server";
import { z } from "zod";

/**----------------------------------------get route list ------------------------------------------- */

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

/**----------------------------------------create route ------------------------------------------- */
const createRouteSchema = z.object({
  title: z.string().min(1),
  region: z.string().min(1),
  summary: z.string().min(1),
  provider: z.enum(["naver", "kakao", "google", "etc"]),
  externalMapUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  distanceKm: z.number().optional(),
  estimatedDurationMinutes: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  sourceType: z.enum(["curated", "user"]).optional(),
});

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CreateRouteBody;
  try {
    payload = await request.json();
    payload = createRouteSchema.parse(payload);
  } catch {
    return badRequest("경로 생성 payload가 올바르지 않습니다.");
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
    return forbidden("경로 생성은 운영자만 가능합니다.");
  }

  const { data, error } = await supabase
    .from("routes")
    .insert({
      title: payload.title.trim(),
      region: payload.region.trim(),
      summary: payload.summary.trim(),
      provider: payload.provider,
      external_map_url: payload.externalMapUrl,
      thumbnail_url: payload.thumbnailUrl ?? null,
      distance_km: payload.distanceKm ?? null,
      estimated_duration_minutes: payload.estimatedDurationMinutes ?? null,
      tags: payload.tags ?? [],
      source_type: payload.sourceType ?? "curated",
      created_by: session.userId,
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
