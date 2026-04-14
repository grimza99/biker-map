import { type CommunityPost } from "@package-shared/types/community";
import { createSupabaseApiClient, internalServerError, ok } from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { mapCommunityPostItem } from "@shared/api/supabase-mappers";

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, category, title, content, excerpt, images, view_count, comment_count, pinned, created_at"
    )
    .eq("author_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return internalServerError(error.message);
  }

  const items = (data ?? [])
    .map((row) =>
      mapCommunityPostItem({
        ...row,
        author_name: session.name,
      })
    )
    .filter((item): item is CommunityPost => Boolean(item));

  return ok({ items });
}
