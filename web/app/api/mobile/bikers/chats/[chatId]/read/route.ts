import type { NextRequest } from "next/server";
import { z } from "zod";

import type {
  TMarkChatReadBody,
  TMarkChatReadResponseData,
} from "@package-shared/index";
import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  notFound,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { updateChatRoomReadState } from "@shared/api/chat";

const chatIdSchema = z.string().uuid();
const markChatReadSchema = z.object({
  lastReadMessageId: z.string().uuid().nullable().optional(),
}) satisfies z.ZodType<TMarkChatReadBody>;

export async function PATCH(
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

  let payload: TMarkChatReadBody;
  try {
    payload = await parseRequestBody(request, markChatReadSchema);
  } catch {
    return badRequest("채팅 읽음 처리 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);

  try {
    const room = await updateChatRoomReadState(
      supabase,
      parsedChatId.data,
      session.userId,
      payload.lastReadMessageId
    );

    if (!room) {
      return notFound("채팅방을 찾을 수 없습니다.");
    }

    return ok({
      room,
    } satisfies TMarkChatReadResponseData);
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "채팅 읽음 상태를 갱신할 수 없습니다."
    );
  }
}
