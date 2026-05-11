import type {
  CreateRouteBody,
  RouteRegion,
  RoutesQuery,
} from "@package-shared/types/route";
import { USER_ROUTE_DAILY_CREATE_LIMIT } from "@package-shared/constants";
import {
  badRequest,
  buildNaverRouteUrl,
  calculateNaverRoutePath,
  createSupabaseApiClient,
  created,
  forbidden,
  getNumberParam,
  getStringParam,
  internalServerError,
  mapRouteListItem,
  ok,
  paginateByCursor,
  tooManyRequests,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import type { NextRequest } from "next/server";
import { z } from "zod";

function getKstDayRange(baseDate = new Date()) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstDate = new Date(baseDate.getTime() + kstOffsetMs);
  const start = new Date(
    Date.UTC(
      kstDate.getUTCFullYear(),
      kstDate.getUTCMonth(),
      kstDate.getUTCDate(),
      -9,
      0,
      0,
      0
    )
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return {
    start,
    end,
  };
}

/**----------------------------------------get route list ------------------------------------------- */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query: RoutesQuery = {
    search: getStringParam(searchParams, "search"),
    departureRegion: getStringParam(searchParams, "departureRegion") as
      | RouteRegion
      | undefined,
    destinationRegion: getStringParam(searchParams, "destinationRegion") as
      | RouteRegion
      | undefined,
    maxDistanceKm: getNumberParam(searchParams, "maxDistanceKm"),
  };

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("source_type", "curated")
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
        if (!item.title.toLowerCase().includes(keyword)) {
          return false;
        }
      }

      if (
        query.departureRegion &&
        query.departureRegion !== "all" &&
        item.departureRegion !== query.departureRegion
      ) {
        return false;
      }

      if (
        query.destinationRegion &&
        query.destinationRegion !== "all" &&
        item.destinationRegion !== query.destinationRegion
      ) {
        return false;
      }

      if (
        query.maxDistanceKm !== undefined &&
        (item.distanceKm === undefined || item.distanceKm > query.maxDistanceKm)
      ) {
        return false;
      }

      return true;
    });

  const { items: pagedItems, meta } = paginateByCursor(items);

  return ok({ items: pagedItems }, undefined, meta);
}

/**----------------------------------------create route ------------------------------------------- */
const createRouteSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().min(1),
  departureRegion: z
    .enum([
      "seoul",
      "busan",
      "daegu",
      "incheon",
      "gwangju",
      "daejeon",
      "ulsan",
      "sejong",
      "jeju",
    ])
    .optional(),
  destinationRegion: z
    .enum([
      "seoul",
      "busan",
      "daegu",
      "incheon",
      "gwangju",
      "daejeon",
      "ulsan",
      "sejong",
      "jeju",
    ])
    .optional(),
  provider: z.enum(["naver", "etc"]).default("naver"),
  externalMapUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  distanceKm: z.number().optional(),
  estimatedDurationMinutes: z.number().int().optional(),
  tags: z.array(z.string()),
  sourceType: z.enum(["curated", "user"]),
  departureLat: z.number(),
  departureLng: z.number(),
  destinationLat: z.number(),
  destinationLng: z.number(),
  waypoints: z
    .array(
      z.object({
        sequence: z.number().int().positive(),
        lat: z.number(),
        lng: z.number(),
      })
    )
    .max(15)
    .default([]),
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

  const isAdmin = profile?.role === "admin";

  if (!isAdmin && payload.sourceType !== "user") {
    return forbidden("큐레이션 경로 생성은 운영자만 가능합니다.");
  }

  if (!isAdmin) {
    const { start, end } = getKstDayRange();
    const { count, error: usageError } = await supabase
      .from("routes")
      .select("id", { count: "exact", head: true })
      .eq("created_by", session.userId)
      .eq("source_type", "user")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());

    if (usageError) {
      return internalServerError(usageError.message);
    }

    if ((count ?? 0) >= USER_ROUTE_DAILY_CREATE_LIMIT) {
      return tooManyRequests(
        `사용자 경로는 하루 ${USER_ROUTE_DAILY_CREATE_LIMIT}개까지 생성할 수 있습니다.`,
        {
          limit: USER_ROUTE_DAILY_CREATE_LIMIT,
          scope: "daily-user-route-create",
        }
      );
    }
  }

  let calculatedRoute;
  try {
    calculatedRoute = await calculateNaverRoutePath({
      departure: {
        lat: payload.departureLat,
        lng: payload.departureLng,
      },
      destination: {
        lat: payload.destinationLat,
        lng: payload.destinationLng,
      },
      waypoints: (payload.waypoints ?? [])
        .slice()
        .sort((a, b) => a.sequence - b.sequence)
        .map((waypoint) => ({
          lat: waypoint.lat,
          lng: waypoint.lng,
        })),
    });
  } catch (directionsError) {
    return internalServerError(
      directionsError instanceof Error
        ? directionsError.message
        : "경로 계산에 실패했습니다."
    );
  }

  const generatedExternalMapUrl =
    payload.externalMapUrl?.trim() ||
    buildNaverRouteUrl({
      appname: new URL(request.url).origin,
      departure: {
        lat: payload.departureLat,
        lng: payload.departureLng,
        name: payload.departureRegion,
      },
      destination: {
        lat: payload.destinationLat,
        lng: payload.destinationLng,
        name: payload.title,
      },
      waypoints: (payload.waypoints ?? [])
        .slice()
        .sort((a, b) => a.sequence - b.sequence)
        .map((waypoint, index) => ({
          lat: waypoint.lat,
          lng: waypoint.lng,
          name: `waypoint-${index + 1}`,
        })),
    });

  const { data, error } = await supabase
    .from("routes")
    .insert({
      title: payload.title.trim(),
      summary: payload.summary.trim(),
      content: payload.content.trim(),
      departure_region: payload.departureRegion ?? null,
      destination_region: payload.destinationRegion ?? null,
      provider: "naver",
      external_map_url: generatedExternalMapUrl,
      thumbnail_url: payload.thumbnailUrl ?? null,
      distance_km: calculatedRoute.distanceKm ?? payload.distanceKm ?? null,
      estimated_duration_minutes:
        calculatedRoute.estimatedDurationMinutes ??
        payload.estimatedDurationMinutes ??
        null,
      tags: payload.tags ?? [],
      source_type: isAdmin ? payload.sourceType ?? "curated" : "user",
      created_by: session.userId,
      departure_lat: payload.departureLat,
      departure_lng: payload.departureLng,
      destination_lat: payload.destinationLat,
      destination_lng: payload.destinationLng,
      directions_calculated_at: new Date().toISOString(),
    })
    .select("id, created_at")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  const routeId = String(data.id);
  const waypoints = (payload.waypoints ?? [])
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((waypoint, index) => ({
      route_id: routeId,
      sequence: index + 1,
      lat: waypoint.lat,
      lng: waypoint.lng,
    }));

  if (waypoints.length) {
    const { error: waypointError } = await supabase
      .from("route_waypoints")
      .insert(waypoints);

    if (waypointError) {
      await supabase.from("routes").delete().eq("id", routeId);
      return internalServerError(waypointError.message);
    }
  }

  const { error: pathError } = await supabase.from("route_paths").insert({
    route_id: routeId,
    path: calculatedRoute.path,
    raw_summary: calculatedRoute.rawSummary ?? null,
    raw_response: calculatedRoute.rawResponse,
  });

  if (pathError) {
    await supabase.from("routes").delete().eq("id", routeId);
    return internalServerError(pathError.message);
  }

  return created({
    id: routeId,
    createdAt: String(data.created_at),
  });
}
