import {
  buildChatRealtimeChannel,
  DEFAULT_CHAT_REALTIME_FEATURE,
  DEFAULT_CHAT_REALTIME_MODE,
  type TChatMessage,
  type TChatMessagePreview,
  type TChatParticipant,
  type TChatParticipantProfile,
  type TChatRoom,
  type TChatMessageRealtimeEvent,
} from "@package-shared/index";

import { createSupabaseServiceClient } from "@shared/lib/supabase";
import type { SupabaseApiClient } from "./supabase";

type ChatDataClient = SupabaseApiClient | ReturnType<typeof createSupabaseServiceClient>;

type ChatRoomRow = {
  id: string;
  kind: "direct";
  created_at: string;
  updated_at: string;
};

type ChatRoomParticipantRow = {
  room_id: string;
  user_id: string;
  joined_at: string;
  last_read_message_id: string | null;
  last_read_at: string | null;
};

type ChatMessageRow = {
  id: string;
  room_id: string;
  author_id: string;
  body: string;
  client_message_id: string;
  created_at: string;
};

type ChatProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bike_brand: string | null;
  bike_model: string | null;
};

type EnsureDirectChatRoomRpcRow = {
  room_id: string;
  created: boolean;
};

export type LoadedChatRoom = {
  room: TChatRoom;
  participantUserIds: string[];
};

export async function loadChatRoomOrNull(
  supabase: ChatDataClient,
  roomId: string
): Promise<LoadedChatRoom | null> {
  const { data: roomRow, error: roomError } = await supabase
    .from("chat_rooms")
    .select("id, kind, created_at, updated_at")
    .eq("id", roomId)
    .maybeSingle<ChatRoomRow>();

  if (roomError) {
    throw new Error(roomError.message);
  }

  if (!roomRow) {
    return null;
  }

  const { data: participantRows, error: participantError } = await supabase
    .from("chat_room_participants")
    .select("room_id, user_id, joined_at, last_read_message_id, last_read_at")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true })
    .returns<ChatRoomParticipantRow[]>();

  if (participantError) {
    throw new Error(participantError.message);
  }

  const participantUserIds = (participantRows ?? []).map((item) => item.user_id);
  const profileMap = await loadChatProfileMap(supabase, participantUserIds);
  const lastMessage = await loadLatestChatMessagePreview(supabase, roomId);

  return {
    room: mapChatRoom(roomRow, participantRows ?? [], profileMap, lastMessage),
    participantUserIds,
  };
}

export async function loadChatMessagesPage(
  supabase: ChatDataClient,
  roomId: string,
  offset: number,
  limit: number
) {
  const from = offset;
  const to = offset + limit - 1;

  const { data: rows, error } = await supabase
    .from("chat_messages")
    .select("id, room_id, author_id, body, client_message_id, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to)
    .returns<ChatMessageRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const { count, error: countError } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("room_id", roomId);

  if (countError) {
    throw new Error(countError.message);
  }

  const messageRows = rows ?? [];
  const profileMap = await loadChatProfileMap(
    supabase,
    Array.from(new Set(messageRows.map((item) => item.author_id)))
  );

  return {
    items: messageRows.map((row) => mapChatMessage(row, profileMap)),
    total: count ?? messageRows.length,
  };
}

export async function findExistingChatMessageByClientMessageId(
  supabase: ChatDataClient,
  roomId: string,
  authorId: string,
  clientMessageId: string
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, room_id, author_id, body, client_message_id, created_at")
    .eq("room_id", roomId)
    .eq("author_id", authorId)
    .eq("client_message_id", clientMessageId)
    .maybeSingle<ChatMessageRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function loadChatMessageById(
  supabase: ChatDataClient,
  messageId: string
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, room_id, author_id, body, client_message_id, created_at")
    .eq("id", messageId)
    .maybeSingle<ChatMessageRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const profileMap = await loadChatProfileMap(supabase, [data.author_id]);
  return mapChatMessage(data, profileMap);
}

export async function broadcastChatMessage(message: TChatMessage) {
  const supabase = createSupabaseServiceClient();
  const channel = supabase.channel(buildChatRealtimeChannel(message.roomId), {
    config: {
      private: true,
    },
  });
  const event: TChatMessageRealtimeEvent = {
    type: "chat:message",
    roomId: message.roomId,
    message,
  };

  try {
    await channel.httpSend(event.type, event);
  } finally {
    await supabase.removeChannel(channel);
  }
}

export async function ensureDirectChatRoom(
  currentUserId: string,
  targetUserId: string
) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc(
    "ensure_direct_chat_room",
    {
      actor_user_id: currentUserId,
      target_user_id: targetUserId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  const ensured = Array.isArray(data) ? data[0] : data;
  const typedEnsured = ensured as EnsureDirectChatRoomRpcRow | null;

  if (!typedEnsured?.room_id) {
    throw new Error("채팅방 식별자를 생성하지 못했습니다.");
  }

  const loaded = await loadChatRoomOrNull(supabase, typedEnsured.room_id);
  if (!loaded) {
    throw new Error("생성된 채팅방을 다시 조회하지 못했습니다.");
  }

  return {
    room: loaded.room,
    created: typedEnsured.created,
  };
}

export function buildChatRealtimeConfig(roomId: string) {
  return {
    mode: DEFAULT_CHAT_REALTIME_MODE,
    feature: DEFAULT_CHAT_REALTIME_FEATURE,
    roomId,
    channel: buildChatRealtimeChannel(roomId),
    privateChannel: true,
    url: undefined,
    connectionToken: undefined,
    connectionPayload: undefined,
    expiresAt: undefined,
  } as const;
}

function mapChatRoom(
  row: ChatRoomRow,
  participantRows: ChatRoomParticipantRow[],
  profileMap: Map<string, TChatParticipantProfile>,
  lastMessage: TChatMessagePreview | null
): TChatRoom {
  const participants: TChatParticipant[] = participantRows.map((item) => ({
    ...(profileMap.get(item.user_id) ?? buildFallbackProfile(item.user_id)),
    joinedAt: item.joined_at,
    lastReadMessageId: item.last_read_message_id,
    lastReadAt: item.last_read_at,
  }));

  return {
    id: row.id,
    kind: row.kind,
    participants,
    lastMessage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapChatMessage(
  row: ChatMessageRow,
  profileMap: Map<string, TChatParticipantProfile>
): TChatMessage {
  return {
    id: row.id,
    roomId: row.room_id,
    authorId: row.author_id,
    body: row.body,
    clientMessageId: row.client_message_id,
    createdAt: row.created_at,
    author: profileMap.get(row.author_id) ?? buildFallbackProfile(row.author_id),
  };
}

async function loadLatestChatMessagePreview(
  supabase: ChatDataClient,
  roomId: string
): Promise<TChatMessagePreview | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, room_id, author_id, body, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle<{
      id: string;
      room_id: string;
      author_id: string;
      body: string;
      created_at: string;
    }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    roomId: data.room_id,
    authorId: data.author_id,
    body: data.body,
    createdAt: data.created_at,
  };
}

async function loadChatProfileMap(
  supabase: ChatDataClient,
  userIds: string[]
): Promise<Map<string, TChatParticipantProfile>> {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueUserIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, bike_brand, bike_model")
    .in("id", uniqueUserIds)
    .returns<ChatProfileRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      {
        userId: profile.id,
        nickname: profile.name?.trim() || "알 수 없는 라이더",
        avatarUrl: profile.avatar_url,
        bikeBrand: profile.bike_brand,
        bikeModel: profile.bike_model,
      } satisfies TChatParticipantProfile,
    ])
  );
}

function buildFallbackProfile(userId: string): TChatParticipantProfile {
  return {
    userId,
    nickname: "알 수 없는 라이더",
    avatarUrl: null,
    bikeBrand: null,
    bikeModel: null,
  };
}
