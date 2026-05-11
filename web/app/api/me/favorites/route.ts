import type { CommunityPost, PostsListResponseData } from "@package-shared/types/community";
import type { FavoriteTargetType } from "@package-shared/types/favorite";
import type { RouteListItem, RoutesListResponseData } from "@package-shared/types/route";
import {
  badRequest,
  createSupabaseApiClient,
  getStringParam,
  internalServerError,
  loadProfileNameMap,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { mapCommunityPostItem, mapRouteListItem } from "@shared/api/supabase-mappers";

function isFavoriteTargetType(
  value: string | undefined
): value is FavoriteTargetType {
  return value === "post" || value === "route";
}

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const searchParams = new URL(request.url).searchParams;
  const type = getStringParam(searchParams, "type");

  if (!isFavoriteTargetType(type)) {
    return badRequest("favorite type이 필요합니다.");
  }

  const supabase = createSupabaseApiClient(request);
  const { data: favoriteRows, error: favoriteError } = await supabase
    .from("favorites")
    .select("target_id, created_at")
    .eq("user_id", session.userId)
    .eq("target_type", type)
    .order("created_at", { ascending: false });

  if (favoriteError) {
    return internalServerError(favoriteError.message);
  }

  const targetIds = (favoriteRows ?? []).map((row) => String(row.target_id));
  if (!targetIds.length) {
    return ok({ items: [] } satisfies PostsListResponseData | RoutesListResponseData);
  }

  if (type === "post") {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, author_id, category, title, content, excerpt, images, view_count, comment_count, pinned, created_at"
      )
      .in("id", targetIds);

    if (error) {
      return internalServerError(error.message);
    }

    let authorMap: Map<string, string>;
    try {
      authorMap = await loadProfileNameMap(
        supabase,
        (data ?? []).map((row) => String(row.author_id ?? ""))
      );
    } catch (profileError) {
      return internalServerError(
        profileError instanceof Error
          ? profileError.message
          : "작성자 정보를 불러오지 못했습니다."
      );
    }

    const postMap = new Map(
      (data ?? [])
        .map((row) =>
          mapCommunityPostItem({
            ...row,
            author_name: authorMap.get(String(row.author_id ?? "")) ?? "익명",
          })
        )
        .filter((item): item is CommunityPost => Boolean(item))
        .map((item) => [item.id, item])
    );

    const items = targetIds
      .map((targetId) => postMap.get(targetId))
      .filter((item): item is CommunityPost => Boolean(item));

    return ok({ items } satisfies PostsListResponseData);
  }

  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .in("id", targetIds);

  if (error) {
    return internalServerError(error.message);
  }

  const routeMap = new Map(
    (data ?? [])
      .map(mapRouteListItem)
      .filter((item): item is RouteListItem => Boolean(item))
      .map((item) => [item.id, item])
  );

  const items = targetIds
    .map((targetId) => routeMap.get(targetId))
    .filter((item): item is RouteListItem => Boolean(item));

  return ok({ items } satisfies RoutesListResponseData);
}
