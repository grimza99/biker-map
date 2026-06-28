import type { ReceivedFavoriteCountResponseData } from "@package-shared/index";

import {
  createSupabaseApiClient,
  internalServerError,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id")
    .eq("author_id", session.userId);

  if (postsError) {
    return internalServerError(postsError.message);
  }

  const postIds = (posts ?? []).map((post) => String(post.id));

  if (!postIds.length) {
    return ok<ReceivedFavoriteCountResponseData>(
      { totalFavoriteCount: 0 },
      undefined,
      { total: 0 }
    );
  }

  const { count, error: favoritesError } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("target_type", "post")
    .in("target_id", postIds);

  if (favoritesError) {
    return internalServerError(favoritesError.message);
  }

  const favoriteCount = count ?? 0;

  return ok<ReceivedFavoriteCountResponseData>(
    { totalFavoriteCount: favoriteCount },
    undefined,
    { total: favoriteCount }
  );
}
