import { type CommunityPost } from "@package-shared/types/community";
import {
  createSupabaseApiClient,
  getNumberParam,
  internalServerError,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { mapCommunityPostItem } from "@shared/api/supabase-mappers";

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(getNumberParam(searchParams, "page") ?? 1, 1);
  const pageSize = Math.min(
    Math.max(getNumberParam(searchParams, "pageSize") ?? 10, 1),
    50
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createSupabaseApiClient(request);
  const { data, count, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, category, title, content, excerpt, images, view_count, comment_count, pinned, created_at",
      { count: "exact" }
    )
    .eq("author_id", session.userId)
    .order("created_at", { ascending: false })
    .range(from, to);

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

  return ok({ items }, undefined, {
    total: count ?? items.length,
  });
}
