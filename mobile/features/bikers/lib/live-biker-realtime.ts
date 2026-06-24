import type { Dispatch, RefObject, SetStateAction } from "react";

import {
  API_PATHS,
  DEFAULT_BIKERS_NEARBY_RADIUS_METERS,
  type TBikerPresenceLeaveEvent,
  type TBikerPresenceItem,
  type TBikerPresenceSyncEvent,
  type TLocationCoordinate,
} from "@package-shared/index";

import {
  fetchSupabaseBroadcastChannelConfig,
  type SupabaseBroadcastBinding,
} from "@/shared";

type CreateLiveBikerRealtimeBindingsOptions = {
  currentLocationRef: RefObject<TLocationCoordinate | null>;
  currentUserId: string | null;
  setNearbyBikers: Dispatch<SetStateAction<TBikerPresenceItem[]>>;
};

export function createLiveBikerRealtimeBindings({
  currentLocationRef,
  currentUserId,
  setNearbyBikers,
}: CreateLiveBikerRealtimeBindingsOptions): SupabaseBroadcastBinding[] {
  return [
    {
      event: "biker:presence-sync",
      onMessage: (payload: unknown) => {
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
      },
    },
    {
      event: "biker:presence-leave",
      onMessage: (payload: unknown) => {
        const event = payload as TBikerPresenceLeaveEvent;

        if (!event?.userId || event.userId === currentUserId) {
          return;
        }

        setNearbyBikers((current) =>
          current.filter((item) => item.userId !== event.userId)
        );
      },
    },
  ];
}

export async function fetchBikerRealtimeChannelConfig() {
  return fetchSupabaseBroadcastChannelConfig({
    expectedFeature: "bikers-location",
    path: API_PATHS.bikers.realtimeConfig,
    unsupportedMessage: "지원하지 않는 실시간 위치 설정입니다.",
  });
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
