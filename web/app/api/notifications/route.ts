import type {
  NotificationSourceType,
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
const notificationSourceTypes = new Set<NotificationSourceType>([
  "post",
  "comment",
  "system",
]);

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
    sourceType: (() => {
      const sourceType = getStringParam(searchParams, "sourceType");
      return sourceType &&
        notificationSourceTypes.has(sourceType as NotificationSourceType)
        ? (sourceType as NotificationSourceType)
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
    if (query.sourceType && item.sourceType !== query.sourceType) {
      return false;
    }

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
