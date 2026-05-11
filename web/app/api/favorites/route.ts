import type {
  CreateFavoriteBody,
  FavoriteItem,
  FavoriteTargetType,
  FavoritesQuery,
} from "@package-shared/types/favorite";
import {
  badRequest,
  created,
  createSupabaseApiClient,
  getNumberParam,
  getStringParam,
  internalServerError,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { z } from "zod";

const createFavoriteSchema = z.object({
  targetType: z.enum(["post", "route"]),
  targetId: z.string().uuid(),
});

function isFavoriteTargetType(
  value: string | undefined
): value is FavoriteTargetType {
  return value === "post" || value === "route";
}

async function ensureTargetExists(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  targetType: FavoriteTargetType,
  targetId: string
) {
  const table = targetType === "post" ? "posts" : "routes";
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", targetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.id);
}

async function loadFavoriteItems(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  userId: string,
  query: FavoritesQuery
): Promise<FavoriteItem[]> {
  const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 20;
  const offset = query.cursor ? Number(query.cursor) || 0 : 0;

  let favoritesQuery = supabase
    .from("favorites")
    .select("id, target_type, target_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (query.type) {
    favoritesQuery = favoritesQuery.eq("target_type", query.type);
  }

  const { data, error } = await favoritesQuery;
  if (error) {
    throw new Error(error.message);
  }

  const favoriteRows = data ?? [];
  const postIds = favoriteRows
    .filter((row) => row.target_type === "post")
    .map((row) => String(row.target_id));
  const routeIds = favoriteRows
    .filter((row) => row.target_type === "route")
    .map((row) => String(row.target_id));

  const [postResult, routeResult] = await Promise.all([
    postIds.length
      ? supabase.from("posts").select("id, title, excerpt").in("id", postIds)
      : Promise.resolve({ data: [], error: null }),
    routeIds.length
      ? supabase.from("routes").select("id, title, summary").in("id", routeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (postResult.error) {
    throw new Error(postResult.error.message);
  }

  if (routeResult.error) {
    throw new Error(routeResult.error.message);
  }

  const postMap = new Map(
    (postResult.data ?? []).map((row) => [
      String(row.id),
      {
        title: String(row.title ?? ""),
        subtitle: String(row.excerpt ?? ""),
      },
    ])
  );
  const routeMap = new Map(
    (routeResult.data ?? []).map((row) => [
      String(row.id),
      {
        title: String(row.title ?? ""),
        subtitle: String(row.summary ?? ""),
      },
    ])
  );

  return favoriteRows.flatMap((row) => {
    const targetType = row.target_type === "post" ? "post" : "route";
    const targetId = String(row.target_id);
    const metadata =
      targetType === "post" ? postMap.get(targetId) : routeMap.get(targetId);

    if (!metadata?.title) {
      return [];
    }

    return [
      {
        id: String(row.id),
        targetType,
        targetId,
        title: metadata.title,
        subtitle: metadata.subtitle || undefined,
      } satisfies FavoriteItem,
    ];
  });
}

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const searchParams = new URL(request.url).searchParams;
  const type = getStringParam(searchParams, "type");
  const cursor = getStringParam(searchParams, "cursor");
  const limit = getNumberParam(searchParams, "limit");
  const favoriteType = isFavoriteTargetType(type) ? type : undefined;

  if (type && !favoriteType) {
    return badRequest("지원하지 않는 favorite 타입입니다.");
  }

  try {
    const supabase = createSupabaseApiClient(request);
    const items = await loadFavoriteItems(supabase, session.userId, {
      type: favoriteType,
      cursor,
      limit,
    });

    return ok({ items });
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "즐겨찾기 목록을 불러오지 못했습니다."
    );
  }
}

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: CreateFavoriteBody;
  try {
    payload = await parseRequestBody(request, createFavoriteSchema);
  } catch {
    return badRequest("즐겨찾기 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);

  try {
    const exists = await ensureTargetExists(
      supabase,
      payload.targetType,
      payload.targetId
    );

    if (!exists) {
      return badRequest("즐겨찾기 대상을 찾을 수 없습니다.");
    }

    const { data: existing, error: existingError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", session.userId)
      .eq("target_type", payload.targetType)
      .eq("target_id", payload.targetId)
      .maybeSingle();

    if (existingError) {
      return internalServerError(existingError.message);
    }

    if (existing?.id) {
      return ok({
        id: String(existing.id),
        targetType: payload.targetType,
        targetId: payload.targetId,
      });
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: session.userId,
        target_type: payload.targetType,
        target_id: payload.targetId,
      })
      .select("id, target_type, target_id")
      .single();

    if (error) {
      return internalServerError(error.message);
    }

    return created({
      id: String(data.id),
      targetType: payload.targetType,
      targetId: payload.targetId,
    });
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "즐겨찾기를 생성하지 못했습니다."
    );
  }
}
