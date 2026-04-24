import {
  createSupabaseApiClient,
  internalServerError,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("notifications")
    .update({ unread: false, read_at: new Date().toISOString() })
    .eq("user_id", session.userId)
    .eq("unread", true)
    .select("id");

  if (error) {
    return internalServerError(error.message);
  }

  const { count: unreadCount, error: countError } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.userId)
    .eq("unread", true);

  if (countError) {
    return internalServerError(countError.message);
  }

  return ok({
    updatedCount: data?.length ?? 0,
    unreadCount: unreadCount ?? 0,
  });
}
