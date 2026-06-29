import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

import { getApiAuthState } from "../api";
import { createSupabaseRealtimeClient } from "./supabase-realtime";

export type SupabaseBroadcastBinding = {
  event: string;
  onMessage: (payload: unknown) => void;
};

export type SupabaseBroadcastChannelConfig = {
  channelName: string;
  privateChannel?: boolean;
};

type UseSupabaseBroadcastRealtimeOptions = {
  accessToken: string | null;
  authMissingMessage?: string;
  bindings: SupabaseBroadcastBinding[];
  connectionKey?: string | number | null;
  disconnectedMessage?: string;
  enabled: boolean;
  loadChannelConfig: () => Promise<SupabaseBroadcastChannelConfig>;
};

type UseSupabaseBroadcastRealtimeResult = {
  broadcast: (event: string, payload: unknown) => Promise<void>;
  canRetry: boolean;
  errorMessage: string | null;
  isConnected: boolean;
  isRetrying: boolean;
  retry: () => void;
};

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = [2000, 5000, 10000] as const;

export function useSupabaseBroadcastRealtime({
  accessToken,
  authMissingMessage = "실시간 연결에 필요한 인증 정보가 없습니다.",
  bindings,
  connectionKey = null,
  disconnectedMessage = "실시간 연결이 끊어졌습니다.",
  enabled,
  loadChannelConfig,
}: UseSupabaseBroadcastRealtimeOptions): UseSupabaseBroadcastRealtimeResult {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const latestOptionsRef = useRef({
    accessToken,
    authMissingMessage,
    bindings,
    disconnectedMessage,
    enabled,
    loadChannelConfig,
  });

  latestOptionsRef.current = {
    accessToken,
    authMissingMessage,
    bindings,
    disconnectedMessage,
    enabled,
    loadChannelConfig,
  };

  useEffect(() => {
    if (!enabled) {
      clearRetryState();
      setIsConnected(false);
      channelRef.current = null;
      return;
    }

    if (!accessToken) {
      clearRetryTimer();
      setIsRetrying(false);
      setCanRetry(false);
      setIsConnected(false);
      channelRef.current = null;
      setErrorMessage(authMissingMessage);
      return;
    }

    let cancelled = false;
    let cleanup: (() => Promise<void> | void) | null = null;
    let isChannelCleanup = false;
    let hasHandledTerminalStatus = false;
    let supabase: SupabaseClient | null = null;
    let channel: RealtimeChannel | null = null;

    async function removeRealtimeChannel() {
      if (!supabase || !channel) {
        return;
      }

        isChannelCleanup = true;
        await supabase.removeChannel(channel);
        setIsConnected(false);
        channelRef.current = null;
        channel = null;
        cleanup = null;
      }

    function scheduleRetry(message: string) {
      clearRetryTimer();

      const nextRetryCount = retryCountRef.current + 1;

      if (nextRetryCount > MAX_RETRY_COUNT) {
        retryCountRef.current = 0;
        setIsRetrying(false);
        setCanRetry(true);
        setErrorMessage(
          `${message} 자동 재연결에 실패했습니다. 다시 연결해 주세요.`
        );
        return;
      }

      retryCountRef.current = nextRetryCount;
      setIsRetrying(true);
      setCanRetry(false);
      setErrorMessage(
        `${message} 다시 연결 중입니다. (${nextRetryCount}/${MAX_RETRY_COUNT})`
      );

      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        setRetryNonce((current) => current + 1);
      }, getRetryDelayMs(nextRetryCount));
    }

    async function subscribeRealtime() {
      try {
        setIsRetrying(retryCountRef.current > 0);
        setCanRetry(false);
        setErrorMessage(null);

        const config = await latestOptionsRef.current.loadChannelConfig();

        if (cancelled) {
          return;
        }

        if (!config.channelName) {
          throw new Error("실시간 채널 설정이 올바르지 않습니다.");
        }

        const latestAccessToken =
          getApiAuthState().accessToken ?? latestOptionsRef.current.accessToken;

        if (!latestAccessToken) {
          throw new Error(latestOptionsRef.current.authMissingMessage);
        }

        supabase = createSupabaseRealtimeClient();
        supabase.realtime.setAuth(latestAccessToken);

        channel = supabase.channel(config.channelName, {
          config: {
            private: config.privateChannel ?? false,
          },
        });
        channelRef.current = channel;

        for (const binding of latestOptionsRef.current.bindings) {
          channel = channel.on(
            "broadcast",
            { event: binding.event },
            ({ payload }) => {
              binding.onMessage(payload);
            }
          );
        }

        const activeChannel = channel;
        const status = await new Promise<string>((resolve) => {
          activeChannel.subscribe((nextStatus) => {
            if (
              nextStatus === "CHANNEL_ERROR" ||
              nextStatus === "TIMED_OUT" ||
              nextStatus === "CLOSED"
            ) {
              if (!hasHandledTerminalStatus && !isChannelCleanup) {
                hasHandledTerminalStatus = true;
                void removeRealtimeChannel();
                scheduleRetry(latestOptionsRef.current.disconnectedMessage);
              }
              resolve(nextStatus);
              return;
            }

            resolve(nextStatus);
          });
        });

        if (cancelled) {
          isChannelCleanup = true;
          await supabase.removeChannel(activeChannel);
          channel = null;
          return;
        }

        if (status !== "SUBSCRIBED") {
          return;
        }

        cleanup = async () => {
          if (!supabase || !channel) {
            return;
          }

          await supabase.removeChannel(channel);
          setIsConnected(false);
          channelRef.current = null;
          channel = null;
        };

        retryCountRef.current = 0;
        setIsRetrying(false);
        setCanRetry(false);
        setIsConnected(true);
        setErrorMessage(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        scheduleRetry(
          error instanceof Error
            ? error.message
            : "실시간 연결을 시작하지 못했습니다."
        );
      }
    }

    void subscribeRealtime();

    return () => {
      cancelled = true;
      clearRetryTimer();

      if (cleanup) {
        isChannelCleanup = true;
        void cleanup();
        return;
      }

      if (channel && supabase) {
        isChannelCleanup = true;
        void supabase.removeChannel(channel);
        setIsConnected(false);
        channelRef.current = null;
        channel = null;
      }
    };
  }, [accessToken, authMissingMessage, connectionKey, enabled, retryNonce]);

  function retry() {
    if (!latestOptionsRef.current.enabled || !latestOptionsRef.current.accessToken) {
      return;
    }

    clearRetryState();
    setRetryNonce((current) => current + 1);
  }

  function clearRetryState() {
    clearRetryTimer();
    retryCountRef.current = 0;
    setIsRetrying(false);
    setCanRetry(false);
    setErrorMessage(null);
  }

  function clearRetryTimer() {
    if (!retryTimerRef.current) {
      return;
    }

    clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  }

  async function broadcast(event: string, payload: unknown) {
    const channel = channelRef.current;

    if (!channel) {
      throw new Error("실시간 채널이 아직 연결되지 않았습니다.");
    }

    const result = await channel.send({
      type: "broadcast",
      event,
      payload,
    });

    if (result !== "ok") {
      throw new Error(`broadcast send failed: ${result}`);
    }
  }

  return {
    broadcast,
    canRetry,
    errorMessage,
    isConnected,
    isRetrying,
    retry,
  };
}

function getRetryDelayMs(retryCount: number) {
  return RETRY_DELAY_MS[retryCount - 1] ?? RETRY_DELAY_MS[RETRY_DELAY_MS.length - 1];
}
