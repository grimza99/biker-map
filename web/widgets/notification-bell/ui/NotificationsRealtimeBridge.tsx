"use client";

import { useNotificationsRealtime } from "@/features/notifications";

export function NotificationsRealtimeBridge() {
  useNotificationsRealtime();
  return null;
}
