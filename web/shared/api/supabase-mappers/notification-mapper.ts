import type {
  InboxNotification,
  NotificationKind,
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

function toNotificationKind(value: string) {
  return notificationKinds.has(value as NotificationKind)
    ? (value as NotificationKind)
    : null;
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

  return {
    id,
    kind,
    title,
    message,
    timeLabel: getRecordRelativeLabel(
      row,
      ["created_at", "createdAt", "time_label", "timeLabel"],
      "방금 전"
    ),
    unread: getRecordBoolean(row, ["unread"], true),
    area: getRecordString(row, ["area"], "커뮤니티"),
  };
}
