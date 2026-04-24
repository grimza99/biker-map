import type {
  NotificationsQuery,
  NotificationsView,
} from "@package-shared/types/notification";
import {
  createSupabaseApiClient,
  getNumberParam,
  getStringParam,
  internalServerError,
  mapNotificationItem,
  ok,
  paginateByCursor,
} from "@shared/api";
import type { NextRequest } from "next/server";
import { requireApiSession } from "@shared/api/auth";

const notificationViews = new Set<NotificationsView>(["all", "unread"]);

export async function GET(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const searchParams = request.nextUrl.searchParams;
  const query: NotificationsQuery = {
    view: (() => {
      const view = getStringParam(searchParams, "view");
      return view && notificationViews.has(view as NotificationsView)
        ? (view as NotificationsView)
        : undefined;
    })(),
    cursor: getStringParam(searchParams, "cursor"),
    limit: getNumberParam(searchParams, "limit"),
  };

  const supabase = createSupabaseApiClient(request);
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return internalServerError(error.message);
  }

  const baseItems = (data ?? [])
    .map(mapNotificationItem)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const items = baseItems.filter((item) => {
    if (query.view === "unread") {
      return item.unread;
    }

    return true;
  });

  const unreadCount = baseItems.filter((item) => item.unread).length;
  const { items: pagedItems, meta } = paginateByCursor(
    items,
    query.cursor,
    query.limit
  );

  return ok(
    {
      items: pagedItems,
      unreadCount,
    },
    undefined,
    meta
  );
}
