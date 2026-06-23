import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import {
  API_PATHS,
  BIKER_LOCATION_UPLOAD_INTERVAL_SECONDS,
  DEFAULT_BIKERS_NEARBY_LIMIT,
  DEFAULT_BIKERS_NEARBY_RADIUS_METERS,
  DEFAULT_BIKER_REALTIME_MODE,
  type TBikerPresenceLeaveEvent,
  type TBikerPresenceItem,
  type TBikerPresenceSyncEvent,
  type TBikerRealtimeConfigResponseData,
  type TBikersNearbyResponseData,
  type TLocationCoordinate,
  type TUpdateMyBikerLocationResponseData,
  type TUpdateMyBikerSharingResponseData,
} from "@package-shared/index";

import { useSession } from "@/features/session/model";
import {
  apiFetch,
  createSupabaseRealtimeClient,
  getApiAuthState,
} from "@/shared";

type SharingSession = {
  sessionId: string;
  sessionVersion: number;
};

type UseLiveBikersOptions = {
  currentLocation: TLocationCoordinate | null;
  enabled: boolean;
};

type UseLiveBikersResult = {
  errorMessage: string | null;
  canRetryRealtime: boolean;
  isSharingEnabled: boolean;
  isRealtimeRetrying: boolean;
  isSyncing: boolean;
  nearbyBikers: TBikerPresenceItem[];
  realtimeErrorMessage: string | null;
  retryRealtime: () => void;
  toggleSharing: (nextValue: boolean) => Promise<void>;
};

const MAX_REALTIME_RETRY_COUNT = 3;
const REALTIME_RETRY_DELAY_MS = [2000, 5000, 10000] as const;

export function useLiveBikers({
  currentLocation,
  enabled,
}: UseLiveBikersOptions): UseLiveBikersResult {
  const { accessToken, user } = useSession();
  const [isSharingEnabled, setIsSharingEnabled] = useState(false);
  const [isAppActive, setIsAppActive] = useState(
    AppState.currentState === "active"
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realtimeErrorMessage, setRealtimeErrorMessage] = useState<
    string | null
  >(null);
  const [isRealtimeRetrying, setIsRealtimeRetrying] = useState(false);
  const [canRetryRealtime, setCanRetryRealtime] = useState(false);
  const [nearbyBikers, setNearbyBikers] = useState<TBikerPresenceItem[]>([]);
  const [sharingSession, setSharingSession] = useState<SharingSession | null>(
    null
  );
  const [realtimeRetryKey, setRealtimeRetryKey] = useState(0);

  const isUploadingRef = useRef(false);
  const isStartingSharingRef = useRef(false);
  const isStoppingSharingRef = useRef(false);
  const isAppActiveRef = useRef(AppState.currentState === "active");
  const lastUploadedAtRef = useRef(0);
  const lastUploadedCoordinateRef = useRef<TLocationCoordinate | null>(null);
  const sharingIntentRef = useRef(false);
  const currentLocationRef = useRef<TLocationCoordinate | null>(currentLocation);
  const realtimeRetryCountRef = useRef(0);
  const realtimeRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  useEffect(() => {
    if (!enabled) {
      clearRealtimeRetryTimer();
      setIsAppActive(AppState.currentState === "active");
      setIsSharingEnabled(false);
      setIsRealtimeRetrying(false);
      setCanRetryRealtime(false);
      setIsSyncing(false);
      setErrorMessage(null);
      setRealtimeErrorMessage(null);
      setNearbyBikers([]);
      setSharingSession(null);
      lastUploadedAtRef.current = 0;
      lastUploadedCoordinateRef.current = null;
      realtimeRetryCountRef.current = 0;
      sharingIntentRef.current = false;
      isAppActiveRef.current = AppState.currentState === "active";
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        const nextIsAppActive = nextAppState === "active";
        isAppActiveRef.current = nextIsAppActive;
        setIsAppActive(nextIsAppActive);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isSharingEnabled || !isAppActive || !sharingSession) {
      clearRealtimeRetryTimer();
      realtimeRetryCountRef.current = 0;
      setIsRealtimeRetrying(false);
      setCanRetryRealtime(false);
      setRealtimeErrorMessage(null);
      return;
    }

    const currentUserId = user?.userId;
    if (!currentUserId || !accessToken) {
      setErrorMessage("실시간 위치 구독을 시작할 인증 정보가 없습니다.");
      return;
    }

    let cancelled = false;
    let cleanup: (() => Promise<void> | void) | null = null;
    let isChannelCleanup = false;
    let hasHandledTerminalStatus = false;

    async function removeRealtimeChannel() {
      if (!cleanup) {
        return;
      }

      isChannelCleanup = true;
      await cleanup();
      cleanup = null;
    }

    function scheduleRealtimeRetry(message: string) {
      clearRealtimeRetryTimer();

      const nextRetryCount = realtimeRetryCountRef.current + 1;

      if (nextRetryCount > MAX_REALTIME_RETRY_COUNT) {
        realtimeRetryCountRef.current = 0;
        setIsRealtimeRetrying(false);
        setCanRetryRealtime(true);
        setRealtimeErrorMessage(
          `${message} 자동 재연결에 실패했습니다. 다시 연결해 주세요.`
        );
        return;
      }

      realtimeRetryCountRef.current = nextRetryCount;
      setIsRealtimeRetrying(true);
      setCanRetryRealtime(false);
      setRealtimeErrorMessage(
        `실시간 연결이 끊어져 다시 연결 중입니다. (${nextRetryCount}/${MAX_REALTIME_RETRY_COUNT})`
      );

      realtimeRetryTimerRef.current = setTimeout(() => {
        realtimeRetryTimerRef.current = null;
        setRealtimeRetryKey((current) => current + 1);
      }, getRealtimeRetryDelayMs(nextRetryCount));
    }

    async function subscribeRealtime() {
      try {
        setIsRealtimeRetrying(realtimeRetryCountRef.current > 0);
        setCanRetryRealtime(false);
        setRealtimeErrorMessage(null);

        const response = await apiFetch.get<TBikerRealtimeConfigResponseData>(
          API_PATHS.bikers.realtimeConfig
        );

        if (cancelled) {
          return;
        }

        if (
          response.data.mode !== DEFAULT_BIKER_REALTIME_MODE ||
          !response.data.channel
        ) {
          throw new Error("지원하지 않는 실시간 위치 설정입니다.");
        }

        const latestAccessToken = getApiAuthState().accessToken;

        if (!latestAccessToken) {
          throw new Error("실시간 위치 구독에 필요한 토큰을 확인할 수 없습니다.");
        }

        const supabase = createSupabaseRealtimeClient();
        supabase.realtime.setAuth(latestAccessToken);

        const channel = supabase
          .channel(response.data.channel)
          .on("broadcast", { event: "biker:presence-sync" }, ({ payload }) => {
            const event = payload as TBikerPresenceSyncEvent;
            const liveLocation = currentLocationRef.current;

            if (!event?.presence || event.presence.userId === currentUserId) {
              return;
            }

            if (!liveLocation) {
              return;
            }

            const distanceMeters = calculateDistanceMeters(
              liveLocation.lat,
              liveLocation.lng,
              event.presence.location.lat,
              event.presence.location.lng
            );

            if (distanceMeters > DEFAULT_BIKERS_NEARBY_RADIUS_METERS) {
              setNearbyBikers((current) =>
                current.filter((item) => item.userId !== event.presence.userId)
              );
              return;
            }

            setNearbyBikers((current) =>
              upsertNearbyBiker(current, {
                ...event.presence,
                isMe: false,
              })
            );
          })
          .on("broadcast", { event: "biker:presence-leave" }, ({ payload }) => {
            const event = payload as TBikerPresenceLeaveEvent;

            if (!event?.userId || event.userId === currentUserId) {
              return;
            }

            setNearbyBikers((current) =>
              current.filter((item) => item.userId !== event.userId)
            );
          });

        const status = await new Promise<string>((resolve) => {
          channel.subscribe((nextStatus) => {
            if (
              nextStatus === "CHANNEL_ERROR" ||
              nextStatus === "TIMED_OUT" ||
              nextStatus === "CLOSED"
            ) {
              if (!hasHandledTerminalStatus && !isChannelCleanup) {
                hasHandledTerminalStatus = true;
                void removeRealtimeChannel();
                scheduleRealtimeRetry("실시간 위치 연결이 끊어졌습니다.");
              }
              resolve(nextStatus);
              return;
            }

            resolve(nextStatus);
          });
        });

        if (cancelled) {
          isChannelCleanup = true;
          await supabase.removeChannel(channel);
          return;
        }

        if (status !== "SUBSCRIBED") {
          return;
        }

        cleanup = async () => {
          await supabase.removeChannel(channel);
        };
        realtimeRetryCountRef.current = 0;
        setIsRealtimeRetrying(false);
        setCanRetryRealtime(false);
        setRealtimeErrorMessage(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        scheduleRealtimeRetry(
          error instanceof Error
            ? error.message
            : "실시간 위치 구독을 시작하지 못했습니다."
        );
      }
    }

    void subscribeRealtime();

    return () => {
      cancelled = true;
      clearRealtimeRetryTimer();
      if (cleanup) {
        isChannelCleanup = true;
        void cleanup();
      }
    };
  }, [
    accessToken,
    enabled,
    isAppActive,
    isSharingEnabled,
    realtimeRetryKey,
    sharingSession,
    user?.userId,
  ]);

  useEffect(() => {
    if (!enabled || !isSharingEnabled || !isAppActive || sharingSession) {
      return;
    }

    void startSharingSession(false);
  }, [enabled, isAppActive, isSharingEnabled, sharingSession]);

  useEffect(() => {
    if (!enabled || !isSharingEnabled || isAppActive || !sharingSession) {
      return;
    }

    void stopSharingSession(true);
  }, [enabled, isAppActive, isSharingEnabled, sharingSession]);

  useEffect(() => {
    if (
      !enabled ||
      !isSharingEnabled ||
      !isAppActive ||
      !sharingSession ||
      !currentLocation
    ) {
      return;
    }

    void uploadCurrentLocationIfDue(currentLocation, sharingSession);
  }, [currentLocation, enabled, isAppActive, isSharingEnabled, sharingSession]);

  useEffect(() => {
    if (
      !enabled ||
      !isSharingEnabled ||
      !isAppActive ||
      !sharingSession ||
      !currentLocation
    ) {
      return;
    }

    const interval = setInterval(() => {
      void uploadCurrentLocationIfDue(currentLocation, sharingSession);
    }, BIKER_LOCATION_UPLOAD_INTERVAL_SECONDS * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentLocation, enabled, isAppActive, isSharingEnabled, sharingSession]);

  async function toggleSharing(nextValue: boolean) {
    if (!enabled) {
      return;
    }

    setErrorMessage(null);

    if (nextValue) {
      sharingIntentRef.current = true;
      setIsSharingEnabled(true);
      return;
    }

    clearRealtimeRetryState();
    sharingIntentRef.current = false;
    setIsSharingEnabled(false);
    await stopSharingSession(false);
  }

  async function startSharingSession(rollbackIntentOnFailure: boolean) {
    if (isStartingSharingRef.current || isStoppingSharingRef.current) {
      return;
    }

    isStartingSharingRef.current = true;
    setIsSyncing(true);

    try {
      const response = await apiFetch.post<TUpdateMyBikerSharingResponseData>(
        API_PATHS.bikers.mySharing,
        {
          sharingStatus: "foreground",
          sharingSessionId: sharingSession?.sessionId ?? null,
          sharingSessionVersion: sharingSession?.sessionVersion ?? null,
        }
      );

      if (!response.data.sharingSessionId || !response.data.sharingSessionVersion) {
        throw new Error("위치 공유 세션 응답이 올바르지 않습니다.");
      }

      const nextSession = {
        sessionId: response.data.sharingSessionId,
        sessionVersion: response.data.sharingSessionVersion,
      };

      if (!sharingIntentRef.current || !isAppActiveRef.current) {
        await sendSharingOff(nextSession);
        return;
      }

      setSharingSession(nextSession);

      if (currentLocation) {
        await uploadCurrentLocation(currentLocation, nextSession);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "위치 공유를 시작하지 못했습니다."
      );

      if (rollbackIntentOnFailure) {
        setIsSharingEnabled(false);
      }
    } finally {
      isStartingSharingRef.current = false;
      setIsSyncing(false);
    }
  }

  async function stopSharingSession(preserveSharingIntent: boolean) {
    if (isStoppingSharingRef.current) {
      return;
    }

    isStoppingSharingRef.current = true;
    const activeSession = sharingSession;

    setIsSyncing(true);

    try {
      if (activeSession) {
        await apiFetch.post<TUpdateMyBikerSharingResponseData>(
          API_PATHS.bikers.mySharing,
          {
            sharingStatus: "off",
            sharingSessionId: activeSession.sessionId,
            sharingSessionVersion: activeSession.sessionVersion,
          }
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "위치 공유를 종료하지 못했습니다."
      );
    } finally {
      clearRealtimeRetryState();
      if (!preserveSharingIntent) {
        sharingIntentRef.current = false;
        setIsSharingEnabled(false);
      }
      setSharingSession(null);
      setNearbyBikers([]);
      lastUploadedAtRef.current = 0;
      lastUploadedCoordinateRef.current = null;
      isStoppingSharingRef.current = false;
      setIsSyncing(false);
    }
  }

  async function sendSharingOff(session: SharingSession) {
    await apiFetch.post<TUpdateMyBikerSharingResponseData>(
      API_PATHS.bikers.mySharing,
      {
        sharingStatus: "off",
        sharingSessionId: session.sessionId,
        sharingSessionVersion: session.sessionVersion,
      }
    );
  }

  async function uploadCurrentLocation(
    location: TLocationCoordinate,
    session: SharingSession
  ) {
    if (isUploadingRef.current) {
      return;
    }

    isUploadingRef.current = true;
    setIsSyncing(true);

    try {
      await apiFetch.post<TUpdateMyBikerLocationResponseData>(
        API_PATHS.bikers.myLocation,
        {
          sharingSessionId: session.sessionId,
          sharingSessionVersion: session.sessionVersion,
          location,
          observedAt: new Date().toISOString(),
        }
      );

      lastUploadedAtRef.current = Date.now();
      lastUploadedCoordinateRef.current = location;

      await fetchNearbyBikers(location);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "현재 위치를 업로드하지 못했습니다."
      );
    } finally {
      isUploadingRef.current = false;
      setIsSyncing(false);
    }
  }

  async function uploadCurrentLocationIfDue(
    location: TLocationCoordinate,
    session: SharingSession
  ) {
    const now = Date.now();
    const hasSameCoordinate =
      lastUploadedCoordinateRef.current?.lat === location.lat &&
      lastUploadedCoordinateRef.current?.lng === location.lng;

    if (
      hasSameCoordinate &&
      now - lastUploadedAtRef.current <
        BIKER_LOCATION_UPLOAD_INTERVAL_SECONDS * 1000
    ) {
      return;
    }

    if (
      now - lastUploadedAtRef.current <
      BIKER_LOCATION_UPLOAD_INTERVAL_SECONDS * 1000
    ) {
      return;
    }

    await uploadCurrentLocation(location, session);
  }

  async function fetchNearbyBikers(location: TLocationCoordinate) {
    const params = new URLSearchParams({
      lat: String(location.lat),
      lng: String(location.lng),
      limit: String(DEFAULT_BIKERS_NEARBY_LIMIT),
      radiusMeters: String(DEFAULT_BIKERS_NEARBY_RADIUS_METERS),
    });

    const response = await apiFetch.get<TBikersNearbyResponseData>(
      `${API_PATHS.bikers.nearby}?${params.toString()}`
    );

    setNearbyBikers(response.data.items);
  }

  function retryRealtime() {
    if (!enabled || !isSharingEnabled || !isAppActive || !sharingSession) {
      return;
    }

    clearRealtimeRetryState();
    setRealtimeRetryKey((current) => current + 1);
  }

  function clearRealtimeRetryState() {
    clearRealtimeRetryTimer();
    realtimeRetryCountRef.current = 0;
    setIsRealtimeRetrying(false);
    setCanRetryRealtime(false);
    setRealtimeErrorMessage(null);
  }

  function clearRealtimeRetryTimer() {
    if (!realtimeRetryTimerRef.current) {
      return;
    }

    clearTimeout(realtimeRetryTimerRef.current);
    realtimeRetryTimerRef.current = null;
  }

  return {
    errorMessage,
    canRetryRealtime,
    isSharingEnabled,
    isRealtimeRetrying,
    isSyncing,
    nearbyBikers,
    realtimeErrorMessage,
    retryRealtime,
    toggleSharing,
  };
}

function getRealtimeRetryDelayMs(retryCount: number) {
  return (
    REALTIME_RETRY_DELAY_MS[retryCount - 1] ??
    REALTIME_RETRY_DELAY_MS[REALTIME_RETRY_DELAY_MS.length - 1]
  );
}

function upsertNearbyBiker(
  current: TBikerPresenceItem[],
  next: TBikerPresenceItem
) {
  const targetIndex = current.findIndex((item) => item.userId === next.userId);

  if (targetIndex < 0) {
    return [...current, next];
  }

  const copied = [...current];
  copied[targetIndex] = next;
  return copied;
}

function calculateDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  const earthRadiusMeters = 6371000;
  const lat1 = degreesToRadians(fromLat);
  const lat2 = degreesToRadians(toLat);
  const deltaLat = degreesToRadians(toLat - fromLat);
  const deltaLng = degreesToRadians(normalizeLongitudeDelta(toLng - fromLng));

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function normalizeLongitudeDelta(deltaLng: number) {
  if (deltaLng > 180) {
    return deltaLng - 360;
  }

  if (deltaLng < -180) {
    return deltaLng + 360;
  }

  return deltaLng;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}
