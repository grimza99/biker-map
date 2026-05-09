import {
  createSupabaseApiClient,
  internalServerError,
  notFound,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ favoriteId: string }> }
) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const { favoriteId } = await params;
  const supabase = createSupabaseApiClient(request);

  const { data, error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId)
    .eq("user_id", session.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return internalServerError(error.message);
  }

  if (!data?.id) {
    return notFound("즐겨찾기를 찾을 수 없습니다.");
  }

  return ok({
    deleted: true,
    favoriteId: String(data.id),
  });
}
