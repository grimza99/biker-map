import {
  createSupabaseApiClient,
  internalServerError,
  notFound,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("notifications")
    .update({ unread: false, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", session.userId)
    .eq("unread", true)
    .select("id, unread")
    .maybeSingle();

  if (error) {
    return internalServerError(error.message);
  }

  if (!data) {
    return notFound("알림을 찾을 수 없습니다.");
  }

  return ok({
    id: String(data.id),
    unread: Boolean(data.unread),
  });
}
