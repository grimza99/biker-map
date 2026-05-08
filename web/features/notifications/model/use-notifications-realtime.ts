"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@package-shared/types/api";
import type { NotificationsResponseData } from "@package-shared/types/notification";

import { useSession } from "@features/session";
import { queryKeys } from "@shared/config/query-keys";
import { createSupabaseRealtimeClient } from "@shared/lib/supabase";
import { useToast } from "@shared/ui";
import { mapNotificationItem } from "@shared/api/supabase-mappers/notification-mapper";
import { prependNotification } from "./use-notifications";

export function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  const { session, accessToken, status } = useSession();
  const { showToast } = useToast();
  const updateInvalidateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    if (status !== "authenticated" || !session?.userId || !accessToken) {
      return;
    }

    const supabase = createSupabaseRealtimeClient();
    supabase.realtime.setAuth(accessToken);

    const channel = supabase
      .channel(`notifications:${session.userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.userId}`,
        },
        (payload) => {
          const item = mapNotificationItem(payload.new as Record<string, unknown>);
          if (item) {
            const notificationQueries =
              queryClient.getQueriesData<ApiResponse<NotificationsResponseData>>({
                queryKey: queryKeys.notificationsRoot,
              });

            for (const [queryKey, current] of notificationQueries) {
              if (!current) {
                continue;
              }

              const queryParams = queryKey[1];
              const filters =
                typeof queryParams === "object" && queryParams !== null
                  ? (queryParams as {
                      sourceType?: NotificationsResponseData["items"][number]["sourceType"];
                      view?: "all" | "unread";
                      limit?: number;
                    })
                  : undefined;

              const nextData = prependNotification(
                current.data,
                item,
                filters?.sourceType,
                filters?.view
              );

              if (!nextData || nextData === current.data) {
                continue;
              }

              const trimmedItems =
                filters?.limit && nextData.items.length > filters.limit
                  ? nextData.items.slice(0, filters.limit)
                  : nextData.items;

              queryClient.setQueryData<ApiResponse<NotificationsResponseData>>(
                queryKey,
                {
                  ...current,
                  data: {
                    ...nextData,
                    items: trimmedItems,
                  },
                }
              );
            }

            showToast({
              tone: "info",
              title: item.title,
              description: item.message,
            });
          }

          void queryClient.invalidateQueries({
            queryKey: queryKeys.notificationsRoot,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.userId}`,
        },
        () => {
          if (updateInvalidateTimerRef.current) {
            clearTimeout(updateInvalidateTimerRef.current);
          }

          updateInvalidateTimerRef.current = setTimeout(() => {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.notificationsRoot,
            });
            updateInvalidateTimerRef.current = null;
          }, 150);
        }
      )
      .subscribe();

    return () => {
      if (updateInvalidateTimerRef.current) {
        clearTimeout(updateInvalidateTimerRef.current);
        updateInvalidateTimerRef.current = null;
      }

      void supabase.removeChannel(channel);
    };
  }, [accessToken, queryClient, session?.userId, showToast, status]);
}
