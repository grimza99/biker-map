export type TChatRoomKind = "direct";

export type TChatParticipantProfile = {
  userId: string;
  nickname: string;
  avatarUrl?: string | null;
  bikeBrand?: string | null;
  bikeModel?: string | null;
};

export type TChatParticipant = TChatParticipantProfile & {
  joinedAt?: string | null;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
};

export type TChatMessagePreview = {
  id: string;
  roomId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type TChatMessage = TChatMessagePreview & {
  clientMessageId: string;
  author: TChatParticipantProfile;
};

export type TChatMessageRealtimeEvent = {
  type: "chat:message";
  roomId: string;
  message: TChatMessage;
};

export type TChatTypingRealtimeEvent = {
  type: "chat:typing";
  roomId: string;
  userId: string;
  isTyping: boolean;
  sentAt?: string;
};

export type TChatPresenceRealtimeEvent = {
  type: "chat:presence";
  roomId: string;
  userId: string;
  status: "join" | "leave";
  sentAt?: string;
};

export type TChatRealtimeEvent =
  | TChatMessageRealtimeEvent
  | TChatTypingRealtimeEvent
  | TChatPresenceRealtimeEvent;

export type TChatRoom = {
  id: string;
  kind: TChatRoomKind;
  participants: TChatParticipant[];
  lastMessage: TChatMessagePreview | null;
  viewerLastReadMessageId?: string | null;
  viewerLastReadAt?: string | null;
  viewerUnreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TChatMessagesQuery = {
  cursor?: string;
  limit?: number;
};

export type TChatRoomResponseData = {
  room: TChatRoom;
};

export type TChatMessageListResponseData = {
  roomId: string;
  items: TChatMessage[];
};

export type TCreateChatMessageBody = {
  body: string;
  clientMessageId: string;
};

export type TCreateChatMessageResponseData = {
  message: TChatMessage;
};

export type TEnsureDirectChatRoomBody = {
  targetUserId: string;
};

export type TEnsureDirectChatRoomResponseData = {
  room: TChatRoom;
  created: boolean;
};

export type TMarkChatReadBody = {
  lastReadMessageId?: string | null;
};

export type TMarkChatReadResponseData = {
  room: TChatRoom;
};
