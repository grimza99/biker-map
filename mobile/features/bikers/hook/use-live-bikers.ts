import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import {
  API_PATHS,
  BIKER_LOCATION_UPLOAD_INTERVAL_SECONDS,
  DEFAULT_BIKERS_NEARBY_LIMIT,
  DEFAULT_BIKERS_NEARBY_RADIUS_METERS,
  type TBikerPresenceItem,
  type TBikersNearbyResponseData,
  type TLocationCoordinate,
  type TUpdateMyBikerLocationResponseData,
  type TUpdateMyBikerSharingResponseData,
} from "@package-shared/index";

import {
  createLiveBikerRealtimeBindings,
  fetchBikerRealtimeChannelConfig,
} from "@/features/bikers/lib/live-biker-realtime";
import { useSession } from "@/features/session/model";
import { apiFetch, useSupabaseBroadcastRealtime } from "@/shared";

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
  const [nearbyBikers, setNearbyBikers] = useState<TBikerPresenceItem[]>([]);
  const [sharingSession, setSharingSession] = useState<SharingSession | null>(
    null
  );

  const isUploadingRef = useRef(false);
  const isStartingSharingRef = useRef(false);
  const isStoppingSharingRef = useRef(false);
  const isAppActiveRef = useRef(AppState.currentState === "active");
  const lastUploadedAtRef = useRef(0);
  const lastUploadedCoordinateRef = useRef<TLocationCoordinate | null>(null);
  const sharingIntentRef = useRef(false);
  const currentLocationRef = useRef<TLocationCoordinate | null>(
    currentLocation
  );

  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  const currentUserId = user?.userId ?? null;
  const realtimeEnabled =
    enabled &&
    isSharingEnabled &&
    isAppActive &&
    Boolean(sharingSession) &&
    Boolean(currentUserId);

  const realtimeConnectionKey = sharingSession
    ? `${currentUserId ?? "anonymous"}:${sharingSession.sessionId}:${
        sharingSession.sessionVersion
      }`
    : null;

  const {
    canRetry: canRetryRealtime,
    errorMessage: realtimeErrorMessage,
    isRetrying: isRealtimeRetrying,
    retry: retryRealtime,
  } = useSupabaseBroadcastRealtime({
    accessToken,
    authMissingMessage: "실시간 위치 구독을 시작할 인증 정보가 없습니다.",
    bindings: createLiveBikerRealtimeBindings({
      currentLocationRef,
      currentUserId,
      setNearbyBikers,
    }),
    connectionKey: realtimeConnectionKey,
    disconnectedMessage: "실시간 위치 연결이 끊어졌습니다.",
    enabled: realtimeEnabled,
    loadChannelConfig: fetchBikerRealtimeChannelConfig,
  });

  useEffect(() => {
    if (!enabled) {
      setIsAppActive(AppState.currentState === "active");
      setIsSharingEnabled(false);
      setIsSyncing(false);
      setErrorMessage(null);
      setNearbyBikers([]);
      setSharingSession(null);
      lastUploadedAtRef.current = 0;
      lastUploadedCoordinateRef.current = null;
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

      if (
        !response.data.sharingSessionId ||
        !response.data.sharingSessionVersion
      ) {
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
