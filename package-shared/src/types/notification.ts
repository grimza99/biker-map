export type NotificationKind = "comment" | "reply" | "reaction" | "system";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  unread: boolean;
  timeLabel: string;
}
export type InboxNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  timeLabel: string;
  unread: boolean;
  area: string;
};

export type NotificationsView = "all" | "unread";

export type NotificationsQuery = {
  view?: NotificationsView;
  cursor?: string;
  limit?: number;
};

export type NotificationsResponseData = {
  items: InboxNotification[];
  unreadCount: number;
};

export type ReadAllNotificationsResponseData = {
  updatedCount: number;
  unreadCount: number;
};

export type ReadNotificationResponseData = {
  id: string;
  unread: boolean;
};
