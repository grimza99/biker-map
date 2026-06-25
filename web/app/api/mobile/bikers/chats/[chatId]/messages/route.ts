import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  MAX_CHAT_MESSAGES_PAGE_SIZE,
  DEFAULT_CHAT_MESSAGES_PAGE_SIZE,
  type TChatMessageListResponseData,
  type TCreateChatMessageBody,
  type TCreateChatMessageResponseData,
} from "@package-shared/index";
import {
  badRequest,
  buildCursor,
  created,
  createSupabaseApiClient,
  getCursorOffset,
  getNumberParam,
  internalServerError,
  notFound,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import {
  broadcastChatMessage,
  findExistingChatMessageByClientMessageId,
  loadChatMessageById,
  loadChatMessagesPage,
  loadChatRoomOrNull,
} from "@shared/api/chat";

const createChatMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  clientMessageId: z.string().trim().min(1).max(120),
}) satisfies z.ZodType<TCreateChatMessageBody>;
const chatIdSchema = z.string().uuid();

type InsertedChatMessageRow = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const parsedChatId = chatIdSchema.safeParse(chatId);
  if (!parsedChatId.success) {
    return badRequest("채팅방 식별자가 올바르지 않습니다.");
  }

  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor") ?? undefined;
  const rawLimit = getNumberParam(searchParams, "limit");
  const limit = rawLimit
    ? Math.min(Math.max(rawLimit, 1), MAX_CHAT_MESSAGES_PAGE_SIZE)
    : DEFAULT_CHAT_MESSAGES_PAGE_SIZE;
  const offset = getCursorOffset(cursor);

  const supabase = createSupabaseApiClient(request);

  try {
    const loaded = await loadChatRoomOrNull(
      supabase,
      parsedChatId.data,
      session.userId
    );
    if (!loaded || !loaded.participantUserIds.includes(session.userId)) {
      return notFound("채팅방을 찾을 수 없습니다.");
    }

    const page = await loadChatMessagesPage(
      supabase,
      parsedChatId.data,
      offset,
      limit
    );
    const nextOffset = offset + page.items.length;
    const nextCursor = nextOffset < page.total ? buildCursor(nextOffset) : null;

    return ok(
      {
        roomId: parsedChatId.data,
        items: page.items,
      } satisfies TChatMessageListResponseData,
      undefined,
      {
        nextCursor,
        total: page.total,
      }
    );
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "채팅 메시지를 조회할 수 없습니다."
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const parsedChatId = chatIdSchema.safeParse(chatId);
  if (!parsedChatId.success) {
    return badRequest("채팅방 식별자가 올바르지 않습니다.");
  }

  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: TCreateChatMessageBody;
  try {
    payload = await parseRequestBody(request, createChatMessageSchema);
  } catch {
    return badRequest("채팅 메시지 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);

  try {
    const loaded = await loadChatRoomOrNull(
      supabase,
      parsedChatId.data,
      session.userId
    );
    if (!loaded || !loaded.participantUserIds.includes(session.userId)) {
      return notFound("채팅방을 찾을 수 없습니다.");
    }

    const trimmedBody = payload.body.trim();
    const message = await createOrReuseChatMessage(
      supabase,
      parsedChatId.data,
      session.userId,
      trimmedBody,
      payload.clientMessageId
    );

    if (!message) {
      return internalServerError("채팅 메시지를 저장하지 못했습니다.");
    }

    await broadcastChatMessage(message);

    return created({
      message,
    } satisfies TCreateChatMessageResponseData);
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "채팅 메시지를 저장할 수 없습니다."
    );
  }
}

async function createOrReuseChatMessage(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  roomId: string,
  authorId: string,
  body: string,
  clientMessageId: string
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      room_id: roomId,
      author_id: authorId,
      body,
      client_message_id: clientMessageId,
    })
    .select("id")
    .single<InsertedChatMessageRow>();

  if (error) {
    if (error.code === "23505") {
      const existing = await findExistingChatMessageByClientMessageId(
        supabase,
        roomId,
        authorId,
        clientMessageId
      );

      if (!existing) {
        throw new Error("중복 메시지를 다시 조회하지 못했습니다.");
      }

      return loadChatMessageById(supabase, existing.id);
    }

    throw new Error(error.message);
  }

  return loadChatMessageById(supabase, data.id);
}
