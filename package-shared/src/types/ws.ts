import type { TBikerPresenceItem } from "./biker";
import type { TChatRealtimeEvent } from "./chat";

export type RealtimeMode = "supabase-realtime" | "websocket";
export type RealtimeFeature =
  | "notifications"
  | "bikers-location"
  | "chat";

export type WsConnectionResponseData = {
  url?: string;
  channel?: string;
  mode: RealtimeMode;
  feature?: RealtimeFeature;
  connectionToken?: string;
  connectionPayload?: Record<string, unknown>;
  expiresAt?: string;
  privateChannel?: boolean;
};

export type TNotificationRealtimeConfigResponseData =
  WsConnectionResponseData & {
    channel: string;
    feature: "notifications";
  };

export type TBikerRealtimeConfigResponseData = WsConnectionResponseData & {
  channel: string;
  feature: "bikers-location";
};

export type TChatRealtimeConfigResponseData = WsConnectionResponseData & {
  channel: string;
  feature: "chat";
  roomId: string;
};

export type TBikerPresenceSyncEvent = {
  type: "biker:presence-sync";
  presence: TBikerPresenceItem;
};

export type TBikerPresenceLeaveEvent = {
  type: "biker:presence-leave";
  userId: string;
  expiresAt: string;
};

export type TBikerPresenceRealtimeEvent =
  | TBikerPresenceSyncEvent
  | TBikerPresenceLeaveEvent;

export type TNotificationRealtimeEvent = {
  type: "notification:new" | "notification:update";
  notificationId: string;
};

export type TRealtimeConfigResponseData =
  | TNotificationRealtimeConfigResponseData
  | TBikerRealtimeConfigResponseData
  | TChatRealtimeConfigResponseData;

export type TRealtimeEvent =
  | TNotificationRealtimeEvent
  | TBikerPresenceRealtimeEvent
  | TChatRealtimeEvent;
