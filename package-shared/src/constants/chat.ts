import type { RealtimeMode } from "../types/ws";

export const DEFAULT_CHAT_MESSAGES_PAGE_SIZE = 30;
export const MAX_CHAT_MESSAGES_PAGE_SIZE = 50;
export const DEFAULT_CHAT_REALTIME_MODE: RealtimeMode = "supabase-realtime";
export const DEFAULT_CHAT_REALTIME_FEATURE = "chat";

export function buildChatRealtimeChannel(roomId: string) {
  return `chat:room:${roomId}`;
}
