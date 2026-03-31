export type NotificationKind = "comment" | "reaction" | "favorite" | "route" | "system";

export type InboxNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  timeLabel: string;
  unread: boolean;
  area: string;
};
