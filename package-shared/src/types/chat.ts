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

export type TChatRoom = {
  id: string;
  kind: TChatRoomKind;
  participants: TChatParticipant[];
  lastMessage: TChatMessagePreview | null;
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
