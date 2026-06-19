import type { RealtimeMode } from "../types/ws";
import type { TBikerLocationSharingStatus } from "../types/biker";

export const BIKER_LOCATION_SHARING_STATUSES = [
  "off",
  "foreground",
] as const satisfies readonly TBikerLocationSharingStatus[];

export const BIKER_LOCATION_UPLOAD_INTERVAL_SECONDS = 5;
export const DEFAULT_BIKERS_NEARBY_RADIUS_METERS = 5000;
export const MAX_BIKERS_NEARBY_RADIUS_METERS = 5000;
export const DEFAULT_BIKERS_NEARBY_LIMIT = 50;
export const MAX_BIKERS_NEARBY_LIMIT = 100;
export const BIKER_PRESENCE_STALE_TIMEOUT_SECONDS = 30;
export const DEFAULT_BIKER_REALTIME_MODE: RealtimeMode = "supabase-realtime";
export const DEFAULT_BIKER_REALTIME_CHANNEL = "bikers-location";
export const DEFAULT_BIKER_REALTIME_FEATURE = "bikers-location";
