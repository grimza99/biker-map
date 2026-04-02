import {
  createSupabaseApiClient,
  internalServerError,
  mapRouteDetail,
  notFound,
  ok,
} from "@shared/api";

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
