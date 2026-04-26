import type {
  CommunityCategorySlug,
  UpdatePostBody,
} from "@package-shared/types/community";
import {
  badRequest,
  createSupabaseApiClient,
  forbidden,
  incrementPostViewCount,
  internalServerError,
  loadProfileNameMap,
  mapCommunityPostDetail,
  notFound,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { z } from "zod";

const updatePostSchema = z
  .object({
    category: z.enum(["notice", "question", "info", "free"]).optional(),
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    images: z.array(z.string()).optional(),
  })
  .refine(
    (value) =>
      value.category !== undefined ||
      value.title !== undefined ||
      value.content !== undefined ||
      value.images !== undefined,
    {
      message: "수정할 항목이 필요합니다.",
    }
  );

/**-----------------------------post detail -------------------------------- */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const supabase = createSupabaseApiClient(_request);

  const { data: currentPost, error: currentPostError } = await supabase
    .from("posts")
    .select(
      "id, author_id, category, title, content, excerpt, images, view_count, comment_count, pinned, created_at"
    )
    .eq("id", postId)
    .maybeSingle();

  if (currentPostError) {
    return internalServerError(currentPostError.message);
  }

  if (!currentPost) {
    return notFound("게시글을 찾을 수 없습니다.");
  }

  let nextViewCount = Number(currentPost.view_count ?? 0);
  try {
    nextViewCount = (await incrementPostViewCount(postId)) ?? nextViewCount;
  } catch (countError) {
    return internalServerError(
      countError instanceof Error
        ? countError.message
        : "조회수를 갱신하지 못했습니다."
    );
  }

  let authorMap: Map<string, string>;
  try {
    authorMap = await loadProfileNameMap(supabase, [
      String(currentPost.author_id ?? ""),
    ]);
  } catch (profileError) {
    return internalServerError(
      profileError instanceof Error
        ? profileError.message
        : "게시글 작성자 정보를 불러오지 못했습니다."
    );
  }

  const post = currentPost
      ? mapCommunityPostDetail({
        ...currentPost,
        view_count: nextViewCount,
        author_name:
          authorMap.get(String(currentPost.author_id ?? "")) ?? "익명",
      })
    : null;
  if (!post) {
    return notFound("게시글을 찾을 수 없습니다.");
  }

  return ok(post);
}

/**-----------------------------update post -------------------------------- */

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: UpdatePostBody;
  try {
    payload = await parseRequestBody(request, updatePostSchema);
  } catch {
    return badRequest("게시글 수정 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);
  const { data: currentPost, error: currentPostError } = await supabase
    .from("posts")
    .select("id, author_id, category")
    .eq("id", postId)
    .maybeSingle();

  if (currentPostError) {
    return internalServerError(currentPostError.message);
  }

  if (!currentPost) {
    return notFound("게시글을 찾을 수 없습니다.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError) {
    return internalServerError(profileError.message);
  }

  const isOwner = String(currentPost.author_id ?? "") === session.userId;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return forbidden("게시글을 수정할 권한이 없습니다.");
  }

  if (!isAdmin && payload.category === "notice") {
    return forbidden("공지 게시글은 운영자만 설정할 수 있습니다.");
  }

  const nextCategory =
    payload.category !== undefined
      ? payload.category
      : (currentPost.category as CommunityCategorySlug | null);

  if (!nextCategory) {
    return badRequest("게시글 카테고리를 확인할 수 없습니다.");
  }

  if (!isAdmin && nextCategory === "notice") {
    return forbidden("공지 게시글은 운영자만 수정할 수 있습니다.");
  }

  const updateInput: Record<string, unknown> = {};

  if (payload.category !== undefined) {
    updateInput.category = payload.category;
  }

  if (payload.title !== undefined) {
    updateInput.title = payload.title.trim();
  }

  if (payload.content !== undefined) {
    const content = payload.content.trim();
    updateInput.content = content;
    updateInput.excerpt = content.slice(0, 120);
  }

  if (payload.images !== undefined) {
    updateInput.images = payload.images;
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updateInput)
    .eq("id", postId)
    .select("id, updated_at")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  return ok({
    id: String(data.id),
    updatedAt: String(data.updated_at),
  });
}

/**-----------------------------delete post -------------------------------- */

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data: currentPost, error: currentPostError } = await supabase
    .from("posts")
    .select("id, author_id")
    .eq("id", postId)
    .maybeSingle();

  if (currentPostError) {
    return internalServerError(currentPostError.message);
  }

  if (!currentPost) {
    return notFound("게시글을 찾을 수 없습니다.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError) {
    return internalServerError(profileError.message);
  }

  const isOwner = String(currentPost.author_id ?? "") === session.userId;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return forbidden("게시글을 삭제할 권한이 없습니다.");
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return internalServerError(error.message);
  }

  return ok({
    id: postId,
    deleted: true as const,
  });
}
