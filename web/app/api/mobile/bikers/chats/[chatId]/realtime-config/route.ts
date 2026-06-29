import type { NextRequest } from "next/server";
import { z } from "zod";

import type { TChatRealtimeConfigResponseData } from "@package-shared/index";
import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  notFound,
  ok,
} from "@shared/api";
import { requireVerifiedApiSession } from "@shared/api/auth";
import { buildChatRealtimeConfig, loadChatRoomOrNull } from "@shared/api/chat";

const chatIdSchema = z.string().uuid();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const parsedChatId = chatIdSchema.safeParse(chatId);
  if (!parsedChatId.success) {
    return badRequest("채팅방 식별자가 올바르지 않습니다.");
  }

  const session = await requireVerifiedApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);

  try {
    const loaded = await loadChatRoomOrNull(supabase, parsedChatId.data);
    if (!loaded || !loaded.participantUserIds.includes(session.userId)) {
      return notFound("채팅방을 찾을 수 없습니다.");
    }

    return ok(
      buildChatRealtimeConfig(parsedChatId.data) satisfies TChatRealtimeConfigResponseData
    );
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "채팅 realtime 설정을 조회할 수 없습니다."
    );
  }
}
