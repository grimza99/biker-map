import type {
  InboxNotification,
  NotificationSourceType,
  NotificationsView,
} from "../types/notification";

export const notificationsfilterTabs: Array<{
  key: NotificationsView;
  label: string;
  buttonVariant?: "primary" | "secondary";
}> = [
  { key: "all", label: "전체", buttonVariant: "primary" },
  { key: "unread", label: "읽지 않음", buttonVariant: "secondary" },
];

export const notificationSourceTabs: Array<{
  key: NotificationSourceType | "all";
  label: string;
}> = [
  { key: "all", label: "전체" },
  { key: "post", label: "내 글" },
  { key: "comment", label: "내 댓글" },
  { key: "system", label: "시스템" },
];

export const notificationskindMeta: Record<
  InboxNotification["kind"],
  { badge: string; tone: "accent" | "neutral" | "danger" }
> = {
  comment: { badge: "댓글", tone: "accent" },
  reply: { badge: "답글", tone: "accent" },
  reaction: { badge: "반응", tone: "neutral" },
  system: { badge: "시스템", tone: "danger" },
};
