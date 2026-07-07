import { communityPostFormSchema } from "@package-shared/schemas";
import type {
  Author,
  CommunityCategorySlug,
  CommunityPostsQuery,
  CreatePostBody,
} from "@package-shared/types/community";
import {
  badRequest,
  communityCategories,
  createSupabaseApiClient,
  created,
  getNumberParam,
  getStringParam,
  internalServerError,
  loadProfileMap,
  mapCommunityPostItem,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import type { NextRequest } from "next/server";

/**----------------------------------------------post list------------------------------------------------- */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = Math.max(getNumberParam(searchParams, "page") ?? 1, 1);
  const pageSize = Math.min(
    Math.max(getNumberParam(searchParams, "pageSize") ?? 8, 1),
    50
  );
  const sort = getStringParam(searchParams, "sort");

  const query: CommunityPostsQuery = {
    category: (() => {
      const category = getStringParam(searchParams, "category");
      return category &&
        communityCategories.has(category as CommunityCategorySlug)
        ? (category as CommunityCategorySlug)
        : undefined;
    })(),
    search: getStringParam(searchParams, "search"),
    page,
    pageSize,
    sort: sort === "views" ? "views" : "latest",
  };

  const supabase = createSupabaseApiClient(request);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let normalPostsQuery = supabase
    .from("posts")
    .select(
      "id, author_id, category, title, content, excerpt, images, view_count, comment_count, pinned, created_at",
      { count: "exact" }
    )
    .eq("pinned", false);

  if (query.category) {
    normalPostsQuery = normalPostsQuery.eq("category", query.category);
  }

  if (query.search) {
    const escapedKeyword = query.search.replace(/[%_,]/g, "");
    normalPostsQuery = normalPostsQuery.or(
      `title.ilike.%${escapedKeyword}%,excerpt.ilike.%${escapedKeyword}%,content.ilike.%${escapedKeyword}%`
    );
  }

  const pinnedPostsQuery =
    page === 1 ? buildPinnedPostsQuery(supabase, query) : null;

  const [normalPostsResult, pinnedPostsResult] = await Promise.all([
    normalPostsQuery
      .order(query.sort === "views" ? "view_count" : "created_at", {
        ascending: false,
      })
      .order("created_at", { ascending: false })
      .range(from, to),
    pinnedPostsQuery,
  ]);

  if (normalPostsResult.error) {
    return internalServerError(normalPostsResult.error.message);
  }

  if (pinnedPostsResult?.error) {
    return internalServerError(pinnedPostsResult.error.message);
  }

  const normalRows = normalPostsResult.data ?? [];
  const pinnedRows = pinnedPostsResult?.data ?? [];
  const authorIds = [...normalRows, ...pinnedRows].map((row) =>
    String(row.author_id ?? "")
  );

  let authorMap: Map<string, Author>;
  try {
    authorMap = await loadProfileMap(supabase, authorIds);
  } catch (profileError) {
    return internalServerError(
      profileError instanceof Error
        ? profileError.message
        : "게시글 작성자 정보를 불러오지 못했습니다."
    );
  }

  const items = mapPostRows(normalRows, authorMap);
  const pinnedItems = mapPostRows(pinnedRows, authorMap);

  return ok({ items, pinnedItems }, undefined, {
    total: normalPostsResult.count ?? items.length,
  });
}

function mapPostRows(
  rows: Array<Record<string, unknown>>,
  authorMap: Map<string, Author>
) {
  return rows
    .map((row) =>
      mapCommunityPostItem({
        ...row,
        author_name: authorMap.get(String(row.author_id ?? ""))?.name ?? "익명",
      })
    )
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function buildPinnedPostsQuery(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  query: CommunityPostsQuery
) {
  let pinnedPostsQuery = supabase
    .from("posts")
    .select(
      "id, author_id, category, title, content, excerpt, images, view_count, comment_count, pinned, created_at"
    )
    .eq("pinned", true);

  if (query.category) {
    pinnedPostsQuery = pinnedPostsQuery.eq("category", query.category);
  }

  if (query.search) {
    const escapedKeyword = query.search.replace(/[%_,]/g, "");
    pinnedPostsQuery = pinnedPostsQuery.or(
      `title.ilike.%${escapedKeyword}%,excerpt.ilike.%${escapedKeyword}%,content.ilike.%${escapedKeyword}%`
    );
  }

  return pinnedPostsQuery.order("created_at", { ascending: false });
}

/**----------------------------------------------create post------------------------------------------------- */

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CreatePostBody;
  try {
    payload = await parseRequestBody(request, communityPostFormSchema);
  } catch {
    return badRequest("게시글 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);
  if (payload.category === "notice") {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.userId)
      .maybeSingle();

    if (profileError) {
      return internalServerError(profileError.message);
    }

    if (profile?.role !== "admin") {
      return badRequest("공지 작성 권한이 없습니다.");
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: session.userId,
      category: payload.category,
      title: payload.title,
      content: payload.content,
      excerpt: payload.content.slice(0, 120),
      images: payload.images ?? [],
      pinned: payload.category === "notice" ? true : false,
    })
    .select("id, created_at")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  return created({
    id: String(data.id),
    createdAt: String(data.created_at),
  });
}
