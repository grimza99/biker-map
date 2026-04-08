import type { UpdateRouteBody } from "@package-shared/types/route";
import {
  badRequest,
  createSupabaseApiClient,
  forbidden,
  internalServerError,
  mapRouteDetail,
  notFound,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { z } from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const supabase = createSupabaseApiClient(_request);

  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("id", routeId)
    .maybeSingle();

  if (error) {
    return internalServerError(error.message);
  }

  const route = data ? mapRouteDetail(data) : null;
  if (!route) {
    return notFound("경로를 찾을 수 없습니다.");
  }

  return ok(route);
}

/**----------------------------------------update route - admin only ------------------------------------------- */

const updateRouteSchema = z
  .object({
    title: z.string().min(1).optional(),
    region: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    provider: z.enum(["naver", "kakao", "google", "etc"]).optional(),
    externalMapUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    distanceKm: z.number().optional(),
    estimatedDurationMinutes: z.number().int().optional(),
    tags: z.array(z.string()).optional(),
    sourceType: z.enum(["curated", "user"]).optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.region !== undefined ||
      value.summary !== undefined ||
      value.provider !== undefined ||
      value.externalMapUrl !== undefined ||
      value.thumbnailUrl !== undefined ||
      value.distanceKm !== undefined ||
      value.estimatedDurationMinutes !== undefined ||
      value.tags !== undefined ||
      value.sourceType !== undefined,
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

  if (profile?.role !== "admin") {
    return forbidden("경로 수정은 운영자만 가능합니다.");
  }

  const { data: currentRoute, error: currentRouteError } = await supabase
    .from("routes")
    .select("id")
    .eq("id", routeId)
    .maybeSingle();

  if (currentRouteError) {
    return internalServerError(currentRouteError.message);
  }

  if (!currentRoute) {
    return notFound("경로를 찾을 수 없습니다.");
  }

  const updateInput: Record<string, unknown> = {};

  if (payload.title !== undefined) updateInput.title = payload.title.trim();
  if (payload.region !== undefined) updateInput.region = payload.region.trim();
  if (payload.summary !== undefined)
    updateInput.summary = payload.summary.trim();
  if (payload.provider !== undefined) updateInput.provider = payload.provider;
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

/**----------------------------------------remove route - admin only ------------------------------------------- */
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

  if (profile?.role !== "admin") {
    return forbidden("경로 삭제는 운영자만 가능합니다.");
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
