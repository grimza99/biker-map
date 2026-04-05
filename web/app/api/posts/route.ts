import type {
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
  loadProfileNameMap,
  mapCommunityPostItem,
  ok,
  parseRequestBody,
  requireApiSession,
} from "@shared/api";
import type { NextRequest } from "next/server";
import { z } from "zod";

const createPostSchema = z.object({
  category: z.enum(["question", "info", "free"]),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

/**----------------------------------------------post list------------------------------------------------- */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = Math.max(getNumberParam(searchParams, "page") ?? 1, 1);
  const pageSize = Math.min(
    Math.max(getNumberParam(searchParams, "pageSize") ?? 12, 1),
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
  let postsQuery = supabase
    .from("posts")
    .select(
      "id, author_id, category, title, content, excerpt, images, view_count, comment_count, pinned, created_at",
      { count: "exact" }
    );

  if (query.category) {
    postsQuery = postsQuery.eq("category", query.category);
  }

  if (query.search) {
    const escapedKeyword = query.search.replace(/[%_,]/g, "");
    postsQuery = postsQuery.or(
      `title.ilike.%${escapedKeyword}%,excerpt.ilike.%${escapedKeyword}%,content.ilike.%${escapedKeyword}%`
    );
  }

  postsQuery =
    query.sort === "views"
      ? postsQuery
          .order("view_count", { ascending: false })
          .order("created_at", { ascending: false })
      : postsQuery.order("created_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await postsQuery.range(from, to);

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
        : "게시글 작성자 정보를 불러오지 못했습니다."
    );
  }

  const items = (data ?? [])
    .map((row) =>
      mapCommunityPostItem({
        ...row,
        author_name: authorMap.get(String(row.author_id ?? "")) ?? "익명",
      })
    )
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return ok({ items }, undefined, {
    total: count ?? items.length,
  });
}

/**-----------------------------create post-------------------------------- */

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CreatePostBody;
  try {
    payload = await parseRequestBody(request, createPostSchema);
  } catch {
    return badRequest("게시글 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: session.userId,
      category: payload.category,
      title: payload.title,
      content: payload.content,
      excerpt: payload.content.slice(0, 120),
      images: payload.images ?? [],
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
