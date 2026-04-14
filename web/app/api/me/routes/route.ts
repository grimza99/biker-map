import { type RouteListItem } from "@package-shared/types/route";
import { createSupabaseApiClient, internalServerError, ok } from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { mapRouteListItem } from "@shared/api/supabase-mappers";

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("created_by", session.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return internalServerError(error.message);
  }

  const items = (data ?? []).map(mapRouteListItem).filter(
    (item): item is RouteListItem => Boolean(item)
  );

  return ok({ items });
}
