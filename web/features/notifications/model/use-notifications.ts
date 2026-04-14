"use client";

import {
  API_PATHS,
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
      apiFetch<ReadAllNotificationsResponseData>(API_PATHS.notifications.readAll, {
        method: "POST",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(filters),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(),
      });
    },
  });
}

export function useReadNotification(filters: NotificationsQuery) {
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
        queryKey: queryKeys.notifications(filters),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(),
      });
    },
  });
}
