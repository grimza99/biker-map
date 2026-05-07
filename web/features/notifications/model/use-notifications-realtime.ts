"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "@features/session";
import { queryKeys } from "@shared/config/query-keys";
import { createSupabaseRealtimeClient } from "@shared/lib/supabase";
import { useToast } from "@shared/ui";
import { mapNotificationItem } from "@shared/api/supabase-mappers/notification-mapper";

export function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  const { session, accessToken, status } = useSession();
  const { showToast } = useToast();

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
          void queryClient.invalidateQueries({
            queryKey: queryKeys.notificationsRoot,
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [accessToken, queryClient, session?.userId, showToast, status]);
}
