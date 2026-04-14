import { InboxNotification, NotificationsView } from "src/types/notification";

export const notificationsfilterTabs: Array<{
  key: NotificationsView;
  label: string;
  buttonVariant?: "primary" | "secondary";
}> = [
  { key: "all", label: "전체", buttonVariant: "primary" },
  { key: "unread", label: "읽지 않음", buttonVariant: "secondary" },
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
