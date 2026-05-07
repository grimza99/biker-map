import type {
  InboxNotification,
  NotificationKind,
  NotificationSourceType,
} from "@package-shared/types/notification";
import {
  getRecordBoolean,
  getRecordRelativeLabel,
  getRecordString,
  SupabaseRecord,
} from "../supabase-record";

const notificationKinds = new Set<NotificationKind>([
  "comment",
  "reply",
  "reaction",
  "system",
]);
const notificationSourceTypes = new Set<NotificationSourceType>([
  "post",
  "comment",
  "system",
]);

function toNotificationKind(value: string) {
  return notificationKinds.has(value as NotificationKind)
    ? (value as NotificationKind)
    : null;
}

function toNotificationSourceType(value: string, kind: NotificationKind) {
  if (notificationSourceTypes.has(value as NotificationSourceType)) {
    return value as NotificationSourceType;
  }

  return kind === "system" ? "system" : "post";
}

export function mapNotificationItem(
  row: SupabaseRecord
): InboxNotification | null {
  const id = getRecordString(row, ["id"]);
  const kind = toNotificationKind(getRecordString(row, ["kind"]));
  const title = getRecordString(row, ["title"]);
  const message = getRecordString(row, ["message"]);

  if (!id || !kind || !title || !message) {
    return null;
  }

  const sourcePostId = getRecordString(row, ["source_post_id", "sourcePostId"]);
  const sourceCommentId = getRecordString(row, [
    "source_comment_id",
    "sourceCommentId",
  ]);
  const sourceRouteId = getRecordString(row, [
    "source_route_id",
    "sourceRouteId",
  ]);
  const rawUrl = getRecordString(row, ["url"], "");
  const sourceType = toNotificationSourceType(
    getRecordString(row, ["source_type", "sourceType"], ""),
    kind
  );

  return {
    id,
    kind,
    sourceType,
    title,
    message,
    timeLabel: getRecordRelativeLabel(
      row,
      ["created_at", "createdAt", "time_label", "timeLabel"],
      "방금 전"
    ),
    unread: getRecordBoolean(row, ["unread"], true),
    sourcePostId: sourcePostId || undefined,
    sourceCommentId: sourceCommentId || undefined,
    url:
      rawUrl ||
      (sourcePostId
        ? `/posts/${sourcePostId}`
        : sourceRouteId
        ? `/routes/${sourceRouteId}`
        : "/notifications"),
  };
}
