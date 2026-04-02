import {
  createSupabaseApiClient,
  internalServerError,
  mapPlaceDetail,
  notFound,
  ok,
} from "@shared/api";

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
