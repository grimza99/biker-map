import type { UpdateRouteBody } from "@package-shared/types/route";
import {
  badRequest,
  calculateNaverRoutePath,
  createSupabaseApiClient,
  forbidden,
  internalServerError,
  loadFavoriteState,
  mapRouteDetail,
  notFound,
  ok,
  parseRequestBody,
} from "@shared/api";
import { getSupabaseAuthSession, requireApiSession } from "@shared/api/auth";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const supabase = createSupabaseApiClient(request);
  const authSession = await getSupabaseAuthSession(request);
  const viewerUserId = authSession?.user.id ?? null;

  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("id", routeId)
    .maybeSingle();

  if (error) {
    return internalServerError(error.message);
  }

  const { data: waypoints, error: waypointsError } = await supabase
    .from("route_waypoints")
    .select("*")
    .eq("route_id", routeId)
    .order("sequence", { ascending: true });

  if (waypointsError) {
    return internalServerError(waypointsError.message);
  }

  const { data: routePath, error: routePathError } = await supabase
    .from("route_paths")
    .select("path")
    .eq("route_id", routeId)
    .maybeSingle();

  if (routePathError) {
    return internalServerError(routePathError.message);
  }

  let favoriteState: { favorited: boolean; favoriteId?: string } = {
    favorited: false,
  };
  try {
    favoriteState = await loadFavoriteState(
      supabase,
      "route",
      routeId,
      viewerUserId
    );
  } catch (favoriteError) {
    return internalServerError(
      favoriteError instanceof Error
        ? favoriteError.message
        : "경로 즐겨찾기 정보를 불러오지 못했습니다."
    );
  }

  const route = data
    ? mapRouteDetail({
        ...data,
        route_waypoints: waypoints ?? [],
        route_paths: routePath ?? null,
        favorite_id: favoriteState.favoriteId,
        favorited: favoriteState.favorited,
      })
    : null;
  if (!route) {
    return notFound("경로를 찾을 수 없습니다.");
  }

  return ok(route);
}

/**----------------------------------------update route ------------------------------------------- */

const updateRouteSchema = z
  .object({
    title: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
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
    provider: z.enum(["naver", "etc"]).optional(),
    externalMapUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    distanceKm: z.number().optional(),
    estimatedDurationMinutes: z.number().int().optional(),
    tags: z.array(z.string()).optional(),
    sourceType: z.enum(["curated", "user"]).optional(),
    departureLat: z.number().optional(),
    departureLng: z.number().optional(),
    destinationLat: z.number().optional(),
    destinationLng: z.number().optional(),
    waypoints: z
      .array(
        z.object({
          sequence: z.number().int().positive(),
          lat: z.number(),
          lng: z.number(),
        })
      )
      .max(15)
      .optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.summary !== undefined ||
      value.content !== undefined ||
      value.departureRegion !== undefined ||
      value.destinationRegion !== undefined ||
      value.provider !== undefined ||
      value.externalMapUrl !== undefined ||
      value.thumbnailUrl !== undefined ||
      value.distanceKm !== undefined ||
      value.estimatedDurationMinutes !== undefined ||
      value.tags !== undefined ||
      value.sourceType !== undefined ||
      value.departureLat !== undefined ||
      value.departureLng !== undefined ||
      value.destinationLat !== undefined ||
      value.destinationLng !== undefined ||
      value.waypoints !== undefined,
    { message: "수정할 항목이 필요합니다." }
  );
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: UpdateRouteBody;
  try {
    payload = await parseRequestBody(request, updateRouteSchema);
  } catch {
    return badRequest("경로 수정 payload가 올바르지 않습니다.");
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

  const { data: currentRoute, error: currentRouteError } = await supabase
    .from("routes")
    .select("*")
    .eq("id", routeId)
    .maybeSingle();

  if (currentRouteError) {
    return internalServerError(currentRouteError.message);
  }

  if (!currentRoute) {
    return notFound("경로를 찾을 수 없습니다.");
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = String(currentRoute.created_by ?? "") === session.userId;

  if (!isAdmin && !isOwner) {
    return forbidden("경로 수정은 작성자 또는 운영자만 가능합니다.");
  }

  const updateInput: Record<string, unknown> = {};
  const shouldRecalculateDirections =
    payload.departureLat !== undefined ||
    payload.departureLng !== undefined ||
    payload.destinationLat !== undefined ||
    payload.destinationLng !== undefined ||
    payload.waypoints !== undefined;

  if (payload.title !== undefined) updateInput.title = payload.title.trim();
  if (payload.summary !== undefined)
    updateInput.summary = payload.summary.trim();
  if (payload.content !== undefined)
    updateInput.content = payload.content.trim();
  if (payload.departureRegion !== undefined)
    updateInput.departure_region = payload.departureRegion;
  if (payload.destinationRegion !== undefined)
    updateInput.destination_region = payload.destinationRegion;
  if (payload.provider !== undefined) updateInput.provider = "naver";
  if (payload.externalMapUrl !== undefined)
    updateInput.external_map_url = payload.externalMapUrl;
  if (payload.thumbnailUrl !== undefined)
    updateInput.thumbnail_url = payload.thumbnailUrl;
  if (payload.distanceKm !== undefined)
    updateInput.distance_km = payload.distanceKm;
  if (payload.estimatedDurationMinutes !== undefined) {
    updateInput.estimated_duration_minutes = payload.estimatedDurationMinutes;
  }
  if (payload.tags !== undefined) updateInput.tags = payload.tags;
  if (payload.sourceType !== undefined)
    updateInput.source_type = payload.sourceType;

  if (payload.departureLat !== undefined)
    updateInput.departure_lat = payload.departureLat;
  if (payload.departureLng !== undefined)
    updateInput.departure_lng = payload.departureLng;
  if (payload.destinationLat !== undefined)
    updateInput.destination_lat = payload.destinationLat;
  if (payload.destinationLng !== undefined)
    updateInput.destination_lng = payload.destinationLng;

  if (shouldRecalculateDirections) {
    const { data: currentWaypoints, error: currentWaypointsError } =
      await supabase
        .from("route_waypoints")
        .select("sequence, lat, lng")
        .eq("route_id", routeId)
        .order("sequence", { ascending: true });

    if (currentWaypointsError) {
      return internalServerError(currentWaypointsError.message);
    }

    const departureLat =
      payload.departureLat ?? Number(currentRoute.departure_lat);
    const departureLng =
      payload.departureLng ?? Number(currentRoute.departure_lng);
    const destinationLat =
      payload.destinationLat ?? Number(currentRoute.destination_lat);
    const destinationLng =
      payload.destinationLng ?? Number(currentRoute.destination_lng);

    if (
      !Number.isFinite(departureLat) ||
      !Number.isFinite(departureLng) ||
      !Number.isFinite(destinationLat) ||
      !Number.isFinite(destinationLng)
    ) {
      return badRequest("출발지와 도착지 좌표가 필요합니다.");
    }

    const nextWaypoints = (payload.waypoints ?? currentWaypoints ?? [])
      .slice()
      .sort((a, b) => Number(a.sequence) - Number(b.sequence))
      .map((waypoint, index) => ({
        sequence: index + 1,
        lat: Number(waypoint.lat),
        lng: Number(waypoint.lng),
      }));

    let calculatedRoute;
    try {
      calculatedRoute = await calculateNaverRoutePath({
        departure: {
          lat: departureLat,
          lng: departureLng,
        },
        destination: {
          lat: destinationLat,
          lng: destinationLng,
        },
        waypoints: nextWaypoints.map((waypoint) => ({
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

    updateInput.provider = "naver";
    updateInput.distance_km = calculatedRoute.distanceKm ?? null;
    updateInput.estimated_duration_minutes =
      calculatedRoute.estimatedDurationMinutes ?? null;
    updateInput.departure_lat = departureLat;
    updateInput.departure_lng = departureLng;
    updateInput.destination_lat = destinationLat;
    updateInput.destination_lng = destinationLng;
    updateInput.directions_calculated_at = new Date().toISOString();

    const routeRollbackInput = {
      title: currentRoute.title,
      summary: currentRoute.summary,
      content: currentRoute.content,
      departure_region: currentRoute.departure_region,
      destination_region: currentRoute.destination_region,
      provider: currentRoute.provider,
      external_map_url: currentRoute.external_map_url,
      thumbnail_url: currentRoute.thumbnail_url,
      distance_km: currentRoute.distance_km,
      estimated_duration_minutes: currentRoute.estimated_duration_minutes,
      tags: currentRoute.tags,
      source_type: currentRoute.source_type,
      departure_lat: currentRoute.departure_lat,
      departure_lng: currentRoute.departure_lng,
      destination_lat: currentRoute.destination_lat,
      destination_lng: currentRoute.destination_lng,
      directions_calculated_at: currentRoute.directions_calculated_at,
    };

    const restoreRoute = async () => {
      await supabase.from("routes").update(routeRollbackInput).eq("id", routeId);
    };

    const restoreWaypoints = async () => {
      await supabase.from("route_waypoints").delete().eq("route_id", routeId);

      if (currentWaypoints?.length) {
        await supabase.from("route_waypoints").insert(
          currentWaypoints.map((waypoint) => ({
            route_id: routeId,
            sequence: Number(waypoint.sequence),
            lat: Number(waypoint.lat),
            lng: Number(waypoint.lng),
          }))
        );
      }
    };

    const { data, error } = await supabase
      .from("routes")
      .update(updateInput)
      .eq("id", routeId)
      .select("id, updated_at")
      .single();

    if (error) {
      return internalServerError(error.message);
    }

    const { error: deleteWaypointError } = await supabase
      .from("route_waypoints")
      .delete()
      .eq("route_id", routeId);

    if (deleteWaypointError) {
      await restoreRoute();
      return internalServerError(deleteWaypointError.message);
    }

    if (nextWaypoints.length) {
      const { error: insertWaypointError } = await supabase
        .from("route_waypoints")
        .insert(
          nextWaypoints.map((waypoint) => ({
            route_id: routeId,
            sequence: waypoint.sequence,
            lat: waypoint.lat,
            lng: waypoint.lng,
          }))
        );

      if (insertWaypointError) {
        await restoreRoute();
        await restoreWaypoints();
        return internalServerError(insertWaypointError.message);
      }
    }

    const { error: upsertPathError } = await supabase
      .from("route_paths")
      .upsert({
        route_id: routeId,
        path: calculatedRoute.path,
        raw_summary: calculatedRoute.rawSummary ?? null,
        raw_response: calculatedRoute.rawResponse,
        calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (upsertPathError) {
      await restoreRoute();
      await restoreWaypoints();
      return internalServerError(upsertPathError.message);
    }

    return ok({
      id: String(data.id),
      updatedAt: String(data.updated_at),
    });
  }

  const { data, error } = await supabase
    .from("routes")
    .update(updateInput)
    .eq("id", routeId)
    .select("id, updated_at")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  return ok({
    id: String(data.id),
    updatedAt: String(data.updated_at),
  });
}

/**----------------------------------------remove route ------------------------------------------- */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
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

  const { data: currentRoute, error: currentRouteError } = await supabase
    .from("routes")
    .select("id, created_by")
    .eq("id", routeId)
    .maybeSingle();

  if (currentRouteError) {
    return internalServerError(currentRouteError.message);
  }

  if (!currentRoute) {
    return notFound("경로를 찾을 수 없습니다.");
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = String(currentRoute.created_by ?? "") === session.userId;

  if (!isAdmin && !isOwner) {
    return forbidden("경로 삭제는 작성자 또는 운영자만 가능합니다.");
  }

  const { error } = await supabase.from("routes").delete().eq("id", routeId);

  if (error) {
    return internalServerError(error.message);
  }

  return ok({
    id: routeId,
    deleted: true as const,
  });
}
