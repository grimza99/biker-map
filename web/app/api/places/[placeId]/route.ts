import type { UpdatePlaceBody } from "@package-shared/types/place";
import {
  badRequest,
  createSupabaseApiClient,
  forbidden,
  internalServerError,
  mapPlaceDetail,
  notFound,
  ok,
  parseRequestBody,
  requireApiSession,
} from "@shared/api";
import { z } from "zod";

/**-----------------------------get place detail-------------------------------- */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;
  const supabase = createSupabaseApiClient(_request);

  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", placeId)
    .maybeSingle();

  if (error) {
    return internalServerError(error.message);
  }

  const place = data ? mapPlaceDetail(data) : null;
  if (!place) {
    return notFound("장소를 찾을 수 없습니다.");
  }

  return ok(place);
}

/**-------------------------------------update place---------------------------------------- */

const updatePlaceSchema = z
  .object({
    name: z.string().min(1).optional(),
    category: z.enum(["gas", "repair", "cafe", "shop", "rest"]).optional(),
    address: z.string().min(1).optional(),
    phone: z.string().optional(),
    description: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    images: z.array(z.string()).optional(),
    naverPlaceUrl: z.string().url().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.category !== undefined ||
      value.address !== undefined ||
      value.phone !== undefined ||
      value.description !== undefined ||
      value.lat !== undefined ||
      value.lng !== undefined ||
      value.images !== undefined ||
      value.naverPlaceUrl !== undefined,
    { message: "수정할 항목이 필요합니다." }
  );

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: UpdatePlaceBody;
  try {
    payload = await parseRequestBody(request, updatePlaceSchema);
  } catch {
    return badRequest("장소 수정 payload가 올바르지 않습니다.");
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
    return forbidden("장소 수정은 운영자만 가능합니다.");
  }

  const { data: currentPlace, error: currentPlaceError } = await supabase
    .from("places")
    .select("id")
    .eq("id", placeId)
    .maybeSingle();

  if (currentPlaceError) {
    return internalServerError(currentPlaceError.message);
  }

  if (!currentPlace) {
    return notFound("장소를 찾을 수 없습니다.");
  }

  const updateInput: Record<string, unknown> = {};

  if (payload.name !== undefined) updateInput.name = payload.name.trim();
  if (payload.category !== undefined) updateInput.category = payload.category;
  if (payload.address !== undefined)
    updateInput.address = payload.address.trim();
  if (payload.phone !== undefined)
    updateInput.phone = payload.phone?.trim() || null;
  if (payload.description !== undefined)
    updateInput.description = payload.description?.trim() || null;
  if (payload.lat !== undefined) updateInput.lat = payload.lat;
  if (payload.lng !== undefined) updateInput.lng = payload.lng;
  if (payload.images !== undefined) updateInput.images = payload.images;
  if (payload.naverPlaceUrl !== undefined)
    updateInput.naver_place_url = payload.naverPlaceUrl;

  const { data, error } = await supabase
    .from("places")
    .update(updateInput)
    .eq("id", placeId)
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

/**-------------------------------------remove place---------------------------------------- */

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;
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
    return forbidden("장소 삭제는 운영자만 가능합니다.");
  }

  const { data: currentPlace, error: currentPlaceError } = await supabase
    .from("places")
    .select("id")
    .eq("id", placeId)
    .maybeSingle();

  if (currentPlaceError) {
    return internalServerError(currentPlaceError.message);
  }

  if (!currentPlace) {
    return notFound("장소를 찾을 수 없습니다.");
  }

  const { error } = await supabase.from("places").delete().eq("id", placeId);

  if (error) {
    return internalServerError(error.message);
  }

  return ok({
    id: placeId,
    deleted: true as const,
  });
}
