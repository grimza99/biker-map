export type RealtimeMode = "supabase-realtime" | "websocket";

export type WsConnectionResponseData = {
  url?: string;
  channel?: string;
  mode: RealtimeMode;
};
