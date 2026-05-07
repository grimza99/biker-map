export type NotificationKind = "comment" | "reply" | "reaction" | "system";
export type NotificationSourceType = "post" | "comment" | "system";

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
  sourceType: NotificationSourceType;
  title: string;
  message: string;
  timeLabel: string;
  unread: boolean;
  url: string;
  sourcePostId?: string;
  sourceCommentId?: string;
};

export type NotificationsView = "all" | "unread";

export type NotificationsQuery = {
  view?: NotificationsView;
  sourceType?: NotificationSourceType;
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
