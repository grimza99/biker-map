import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { TLocationCoordinate } from "@package-shared/types";

type LocationPermissionState = "unknown" | "granted" | "denied";

type UseCurrentLocationResult = {
  currentLocation: TLocationCoordinate | null;
  errorMessage: string | null;
  isLoading: boolean;
  permissionState: LocationPermissionState;
  requestPermission: () => Promise<void>;
};

export function useCurrentLocation(enabled: boolean): UseCurrentLocationResult {
  const [currentLocation, setCurrentLocation] =
    useState<TLocationCoordinate | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [permissionState, setPermissionState] =
    useState<LocationPermissionState>("unknown");
  const [refreshKey, setRefreshKey] = useState(0);
  const hasResolvedWatchLocationRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let activeSubscription: Location.LocationSubscription | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function startWatching() {
      setIsLoading(true);
      setErrorMessage(null);
      setCurrentLocation(null);
      hasResolvedWatchLocationRef.current = false;

      try {
        const existingPermission =
          await Location.getForegroundPermissionsAsync();

        const foregroundPermission =
          existingPermission.status === "granted"
            ? existingPermission
            : await Location.requestForegroundPermissionsAsync();

        if (!mounted) {
          return;
        }

        if (foregroundPermission.status !== "granted") {
          setPermissionState("denied");
          setErrorMessage(
            "현재 위치 권한이 없어 내 위치를 지도에 표시할 수 없습니다."
          );
          setIsLoading(false);
          return;
        }

        setPermissionState("granted");

        const hasServicesEnabled = await Location.hasServicesEnabledAsync();

        if (!mounted) {
          return;
        }

        if (!hasServicesEnabled) {
          setErrorMessage(
            "기기의 위치 서비스가 꺼져 있어 현재 위치를 가져올 수 없습니다."
          );
          setIsLoading(false);
          return;
        }

        try {
          activeSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              distanceInterval: 0,
              timeInterval: 1000,
            },
            (position) => {
              if (!mounted) {
                return;
              }

              setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              hasResolvedWatchLocationRef.current = true;
              setErrorMessage(null);
              setIsLoading(false);
            }
          );
        } catch (error) {
          throw error;
        }

        if (!mounted) {
          activeSubscription?.remove();
          return;
        }

        retryTimer = setTimeout(() => {
          if (!mounted || hasResolvedWatchLocationRef.current) {
            return;
          }

          setErrorMessage(
            "현재 좌표를 아직 받지 못했습니다. 에뮬레이터 위치를 다시 Set location 해 주세요."
          );
          setIsLoading(false);
        }, 2500);
      } catch (error) {
        if (!mounted) {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "알 수 없는 위치 오류";

        if (
          errorMessage.includes("location services") ||
          errorMessage.includes("provider is unavailable")
        ) {
          setErrorMessage(
            "기기의 위치 서비스가 꺼져 있어 현재 위치를 가져올 수 없습니다."
          );
        } else {
          setErrorMessage("현재 위치를 불러오지 못했습니다.");
        }
        setIsLoading(false);
      }
    }

    void startWatching();

    return () => {
      mounted = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      activeSubscription?.remove();
    };
  }, [enabled, refreshKey]);

  return {
    currentLocation,
    errorMessage,
    isLoading,
    permissionState,
    async requestPermission() {
      const permission = await Location.requestForegroundPermissionsAsync();
      setPermissionState(
        permission.status === "granted" ? "granted" : "denied"
      );
      if (permission.status === "granted") {
        setRefreshKey((current) => current + 1);
      }
    },
  };
}
