"use client";

import {
  API_PATHS,
  type InboxNotification,
  type NotificationSourceType,
  type NotificationsQuery,
  type NotificationsResponseData,
  type ReadAllNotificationsResponseData,
  type ReadNotificationResponseData,
} from "@package-shared/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

function buildNotificationsSearchParams(filters: NotificationsQuery) {
  const searchParams = new URLSearchParams();

  if (filters.view) {
    searchParams.set("view", filters.view);
  }

  if (filters.sourceType) {
    searchParams.set("sourceType", filters.sourceType);
  }

  if (filters.cursor) {
    searchParams.set("cursor", filters.cursor);
  }

  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }

  return searchParams.toString();
}

export function useNotifications(filters: NotificationsQuery) {
  const query = buildNotificationsSearchParams(filters);

  return useQuery({
    queryKey: queryKeys.notifications(filters),
    queryFn: async () => {
      const endpoint = query
        ? `${API_PATHS.notifications.list}?${query}`
        : API_PATHS.notifications.list;

      return apiFetch<NotificationsResponseData>(endpoint);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useReadAllNotifications(filters: NotificationsQuery) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      apiFetch<ReadAllNotificationsResponseData>(
        API_PATHS.notifications.readAll,
        {
          method: "POST",
        }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(filters),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notificationsRoot,
      });
    },
  });
}

export function useReadNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) =>
      apiFetch<ReadNotificationResponseData>(
        API_PATHS.notifications.read(notificationId),
        {
          method: "POST",
        }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notificationsRoot,
      });
    },
  });
}

export function prependNotification(
  current: NotificationsResponseData | undefined,
  nextItem: InboxNotification,
  sourceType?: NotificationSourceType,
  view?: NotificationsQuery["view"]
) {
  if (!current) {
    return current;
  }

  if (sourceType && nextItem.sourceType !== sourceType) {
    return current;
  }

  if (view === "unread" && !nextItem.unread) {
    return current;
  }

  if (current.items.some((item) => item.id === nextItem.id)) {
    return current;
  }

  return {
    ...current,
    items: [nextItem, ...current.items],
    unreadCount: nextItem.unread ? current.unreadCount + 1 : current.unreadCount,
  };
}
