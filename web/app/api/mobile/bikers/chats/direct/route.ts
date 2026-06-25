import type { NextRequest } from "next/server";
import { z } from "zod";

import type {
  TEnsureDirectChatRoomBody,
  TEnsureDirectChatRoomResponseData,
} from "@package-shared/index";
import {
  badRequest,
  created,
  internalServerError,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { ensureDirectChatRoom } from "@shared/api/chat";

const ensureDirectChatRoomSchema = z.object({
  targetUserId: z.string().uuid(),
}) satisfies z.ZodType<TEnsureDirectChatRoomBody>;

export async function POST(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: TEnsureDirectChatRoomBody;
  try {
    payload = await parseRequestBody(request, ensureDirectChatRoomSchema);
  } catch {
    return badRequest("채팅방 생성 payload가 올바르지 않습니다.");
  }

  try {
    const result = await ensureDirectChatRoom(
      session.userId,
      payload.targetUserId
    );

    const responseBody = {
      room: result.room,
      created: result.created,
    } satisfies TEnsureDirectChatRoomResponseData;

    return result.created ? created(responseBody) : ok(responseBody);
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "채팅방을 준비할 수 없습니다."
    );
  }
}
