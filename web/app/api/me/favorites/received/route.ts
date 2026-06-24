import {
  createSupabaseApiClient,
  internalServerError,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import type { ReceivedFavoriteCountResponseData } from "@package-shared/index";

/**------------------------------- 내가 받은 좋아요 받은 커뮤니티 글 갯수 ------------------------------------ */
export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("posts")
    .select("favorite_count")
    .eq("author_id", session.userId);

  if (error) {
    return internalServerError(error.message);
  }

  const favoriteCount =
    data?.reduce((sum, post) => sum + (post.favorite_count ?? 0), 0) ?? 0;

  return ok<ReceivedFavoriteCountResponseData>(
    { totalFavoriteCount: favoriteCount },
    undefined,
    { total: favoriteCount }
  );
}
